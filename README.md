# flyguy

On the fly filetype conversion based on file extensions.

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
			convert: function(str) {
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

## Copyright &amp; License

&copy; 2016 Jason Frame [ [@jaz303](http://twitter.com/jaz303) / [jason@onehackoranother.com](mailto:jason@onehackoranother.com) ]

Released under the ISC license.