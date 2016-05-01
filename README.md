# flyguy

On the fly filetype conversion based on MIME types and/or file extensions.

Let's say you had a directory of Markdown documents. `flyguy` lets you convert these to HTML by simply substituting the `.md` extension for `.htm` and then reading from it. So if you have `foobar.md` on your drive, opening `foobar.htm` would transparently convert its contents to HTML.

Think of it as content negotiation for the filesystem.

Of course, you're not limited to Markdown and HTML - conversions can be defined between any desired file formats.

## Installation

```shell
$ npm install flyguy
```

## Quickstart

First, define your converters as an object that maps source types to destination types. File types may be specified either by extension or MIME type. Here, we'll create a single converter that translates markdown to HTML using `marked`:

```javascript
const marked = require('marked');

const converters = {
    md: {
        htm: {
            string: true,
            convert: function(str, state) {
                return marked(str);
            }
        }
    }
};
```

(the `string` property means that the source file should be read as a string rather than as a binary `Buffer`)

Next instantiate a flyguy instance for a given root directory:

```javascript
const flyguy = require('flyguy');

const fg = flyguy("/home/jason/somedir", {
    converters: converters
});
```

Now we can open non-existent files and have them be transparently generated, if a suitable source file exists. Assuming `/home/jason/somedir/docs.md` exists, we can do the following to convert it into HTML:

```javascript
const stream = fg.createReadStream('docs.htm');
stream.on('data', (html) => {
    console.log("conversion complete");
    console.log(html);
});
```

## API

#### `var fg = flyguy([rootDirectory], opts)`

Create a new instance.

  * `rootDirectory` - files will be opened relative to this directory. If omitted, defaults to the root directory.
  * `opts` - configuration; valid keys:
    * `converters`: object specifying converters, see below

#### `var stream = fg.createReadStream(file, [opts])`

Read data from a file, performing transparent format conversion if said file does not exist and a suitable conversion is defined.

`opts` are passed to the underlying file stream.

Returns a readable stream.

## Converters

Converters are specified as nested maps of source to target file types. File types may be specified as either filename extensions or MIME types, with filename extension taking precedence. Here's a configuration that will convert `md` files into `pdf`, `htm` and `tex`, and `pdf` files into `htm`:

```javascripts
{
    md: {
        pdf: {
            // converter implementation
            // ...
        },
        htm: {
            // converter implementation
            // ...
        },
        tex: {
            // converter implementation
            // ...
        }
    },
    pdf: {
        htm: {
            // converter implementation
            // ...
        }
    }
}
```

The converter implementation is straightforward:

```javascript
{
    string: false, // optional, default = false
    streaming: false, // optional, default = false
    init: function() { // optional
        return { ... };
    },
    convert: function(data, state) { // required
        // transform `data` here and return
    }
}
```

`convert` is a function that takes the source data and returns the transformed data. By default, the entirety of the data to be converted is passed to a single call to `convert`, but if `streaming` is set, `convert` will instead be called once for each chunk emitted by the underlying file stream. By default, `Buffer` instances are passed as data to `convert`. Set `string` to true to indicate that data should first be decoded to a string; in this instance, the `encoding` parameter (if present) will be respected in the initial call to `createReadStream`.

If the conversion process is stateful, implement the `init` function which should return the initial state of the conversion process; this will be passed as the second argument to `convert`.

## TODO

  - [ ] support async conversion functions
  - [ ] support arrays of converter objects, performing merging internally
  - [ ] derive higher order conversions via tree search

## Copyright &amp; License

&copy; 2016 Jason Frame [ [@jaz303](http://twitter.com/jaz303) / [jason@onehackoranother.com](mailto:jason@onehackoranother.com) ]

Released under the ISC license.