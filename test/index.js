const test = require('tape');
const marked = require('marked');
const flyguy = require('../');

const CONVERTERS = {
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
};

function instance() {
    return flyguy(__dirname + '/fixtures', {
        converters: CONVERTERS
    });
}

function readStringFile(stream, cb) {
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

test('defaults to root directory', (assert) => {
    const fg = flyguy({ converters: CONVERTERS });
    assert.equal(fg.rootDirectory, '/');
    assert.end();
});

test('does not exist', (assert) => {
    const fg = instance();
    const stream = fg.createReadStream('foobar.md');
    stream.on('error', (err) => {
        assert.ok(err);
        assert.end();
    });
});

test('conversion - non-streaming, string', (assert) => {
    assert.plan(2);
    const fg = instance();
    const stream = fg.createReadStream('hello.htm');
    stream.on('converter', (c) => {
        assert.equal(c, CONVERTERS['md']['text/html']);
    })
    readStringFile(stream, (err, str) => {
        assert.equal('<h1 id="hello">Hello</h1>\n', str);
    });
});

test('conversion - streaming, string', (assert) => {
    assert.plan(2);
    const fg = instance();
    const stream = fg.createReadStream('uppercase.uppercase');
    stream.on('converter', (c) => {
        assert.equal(c, CONVERTERS['txt']['uppercase']);
    })
    readStringFile(stream, (err, str) => {
        assert.equal('GOODNESS GRACIOUS GREAT BALLS OF FIRE', str);
    });
});
