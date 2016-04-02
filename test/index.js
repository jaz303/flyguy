const test = require('tape');
const marked = require('marked');
const flyguy = require('../');

function instance() {
    return flyguy(__dirname + '/fixtures', {
        converters: {
            md: {
                'text/html': {
                    string: true,
                    streaming: false,
                    convert: function(str) {
                        return marked(str);
                    }
                }
            },
            txt: {
                uppercase: {
                    string: true,
                    streaming: true,
                    convert: function(str) {
                        return str.toUpperCase();
                    }
                }
            }       
        }
    });
}

function readStringFile(fg, path, cb) {
    const stream = fg.createReadStream(path);
    var src = '';
    stream.on('data', (chunk) => {
        src += chunk;
    });
    stream.on('end', () => {
        cb(null, src);
    });
    stream.on('error', (err) => {
        cb(err);
    });
}

test('does not exist', (assert) => {
    const fg = instance();
    readStringFile(fg, 'foobar.md', (err, str) => {
        assert.ok(err);
        assert.end();
    });
});

test('conversion - non-streaming, string', (assert) => {
    const fg = instance();
    readStringFile(fg, 'hello.htm', (err, str) => {
        assert.equal('<h1 id="hello">Hello</h1>\n', str);
        assert.end();
    });
});

test('conversion - streaming, string', (assert) => {
    const fg = instance();
    readStringFile(fg, 'uppercase.uppercase', (err, str) => {
        assert.equal('GOODNESS GRACIOUS GREAT BALLS OF FIRE', str);
        assert.end();
    });
});
