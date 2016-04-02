module.exports = create;

const fs = require('fs');
const join = require('path').join;
const dirname = require('path').dirname;
const extname = require('path').extname;
const parsePath = require('path').parse;
const mime = require('mime');
const through = require('through');

const PASSTHROUGH = {
    streaming: true,
    convert: function(data) { return data; }
};

function create(rootDirectory, opts) {
    if (!opts) throw new Error("opts must be provided");

    const converters = opts.converters;
    if (!converters) throw new Error("converters must be specified");

    return {
        createReadStream: function(path, opts) {
            opts = opts || {};
            const fullPath = join(rootDirectory, path);

            var isString, isStreaming, convert, chunks;
            
            const stream = through(function write(data) {
                if (isStreaming) {
                    this.emit('data', convert(data));
                } else {
                    chunks.push(data);
                }
            }, function end() {
                if (!isStreaming) {
                    const source = isString ? chunks.join('') : Buffer.concat(chunks);
                    this.emit('data', convert(source));
                }
                this.emit('end');
            });
            
            findConverter(fullPath, (err, sourcePath, converter) => {
                if (err) {
                    stream.emit('error', err);
                    return;
                }

                stream.emit('converter', converter);
                
                isString = !!converter.string;
                if ('streaming' in converter && converter.streaming) {
                    isStreaming = true;
                } else {
                    isStreaming = false;
                    chunks = [];
                }

                convert = converter.convert;
                if (converter !== PASSTHROUGH) {
                    if (isString) {
                        opts.encoding = opts.encoding || 'utf8';
                    } else {
                        delete opts.encoding;
                    }    
                }
                
                fs.createReadStream(sourcePath, opts).pipe(stream);
            });
            
            return stream;
        }
    };

    function findConverter(path, cb) {
        fs.stat(path, (err, stats) => {
            // file exists - return same path
            if (stats) return cb(null, path, PASSTHROUGH);
            const reqPath = parsePath(path);
            fs.readdir(reqPath.dir, (err, entries) => {
                if (err) return cb(err);
                for (var ix = 0; ix < entries.length; ++ix) {
                    var srcPath = parsePath(entries[ix]);
                    if (srcPath.name === reqPath.name) {
                        var converter = lookupConverter(srcPath.ext.substr(1), reqPath.ext.substr(1));
                        if (converter) {
                            return cb(null, join(reqPath.dir, srcPath.base), converter);
                        }
                    }
                }
                // not conversion found - just return same path so the open operation fails
                return cb(new Error("no conversion found"));
            });
        });
    }

    function lookupConverter(fromExt, toExt) {
        const fromMime = mime.lookup(fromExt);
        const toMime = mime.lookup(toExt);
        const source = converters[fromExt] || converters[fromMime] || {};
        return source[toExt] || source[toMime];
    }
}