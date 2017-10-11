## pdfmerger

_pdfmerger_ combines multiple PDF-files into a single PDF-file. It is a node module that utilizes the
[Apache PDFBox Library](http://pdfbox.apache.org), which the required functionality are distributed along with this module. The only requirement for this module to run, is having Java 6 or higher in the path.

This package is inspired from karuppiah's [easy-pdf-merge](https://github.com/karuppiah7890/easy-pdf-merge), but instead of using a callback approach, this module returns a stream interface.

## Usage:

The module can merge a provided list of PDFs, or merge all PDFs present in a directory of your choice, in alphanumeric order. You can set a file path, which will write the file to that location, or just handle the stream yourselves.

``` javascript
var pdfmerger = require('pdfmerger');

// Combining pdfs by using file paths

var pdfs = [
  '/path/to/pdf1.pdf',
  '/path/to/pdf2.pdf'
];

var pdfStream = pdfmerger(pdfs);

var writeStream = fs.createWriteStream('path/to/combined.pdf');
pdfStream.pipe(writeStream);

// write the output to a file

pdfmerger(pdfs, '/path/to/combined.pdf');

// combine all pdfs in a directory

pdfmerger('/path/to/directory', '/path/to/combined.pdf');

// set max java heap limit and initial heap size in megabytes

pdfmerger('/path/to/directory', '/path/to/combined.pdf', {
  maxHeap: 512,
  minHeap: 32
});

// Stream events

pdfStream.on('data', function(data) {

});

pdfStream.on('error', function(error) {

});

pdfStream.on('close', function(code) {

});

```

## Issues and Feature Requests

If there are issues or feature requests, go to the [github issues page of the module](https://github.com/bompi88/pdfmerger/issues).

## Licenses

### Project License - Apache License 2.0

The license is inherited from the PDFBox project.

```
Copyright 2017 Bjørn Bråthen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### Pdfs used for testing

res/pdf1.pdf - the first 20 pages of [_Making260_](https://github.com/making360/making360) - This resource is licensed under [Creative Commons - Attribution-NonCommercial-ShareAlike-4.0 International](http://creativecommons.org/licenses/by-nc-sa/4.0/).

res/pdf2.pdf - the first 20 pages of [TypeScript Deep Dive](https://github.com/basarat/typescript-book), by Barasat Ali Syed - [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).
