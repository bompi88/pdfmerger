var fs = require('fs');
var path = require('path');
var testing = require('testing');
var mkdirp = require('mkdirp');
var pdfmerger = require(`./distribution/index.js`);
var trash = require('trash');

var resDir = 'res' + path.sep;
var outDir = resDir + 'out' + path.sep;
var singleDir = resDir + 'single' + path.sep;
var pdf1 = resDir + 'pdf1.pdf';
var pdf2 = resDir + 'pdf2.pdf';

// Should work

// Array of file paths as input, writing to file using fs.
function filesAndStream(callback) {
  var fileCombined = outDir + 'filesAndStream.pdf';
  var writeStream = fs.createWriteStream(fileCombined);
  var pdfStream = pdfmerger([pdf1, pdf2]);

  pdfStream.on('error', function(error) {
    testing.failure(error.message, callback);
  });

  writeStream.on('error', function(error) {
    testing.failure('Could not write file', callback);
  });

  writeStream.on('finish', function() {
    fs.readFile(fileCombined, function(error, result) {
      if (error) {
        testing.failure('File not read', callback);
      }
      testing.assert(result, 'Empty file', callback);
      testing.success(callback);
    });
  });

  pdfStream.pipe(writeStream);
}

function maxAndMinHeap(callback) {
  var fileCombined = outDir + 'maxAndMinHeap.pdf';
  var writeStream = fs.createWriteStream(fileCombined);
  var pdfStream = pdfmerger([pdf1, pdf2], null, {
    maxHeap: 512,
    minHeap: 32
  });

  pdfStream.on('error', function(error) {
    testing.failure(error.message, callback);
  });

  writeStream.on('error', function(error) {
    testing.failure('Could not write file', callback);
  });

  writeStream.on('finish', function() {
    fs.readFile(fileCombined, function(error, result) {
      if (error) {
        testing.failure('File not read', callback);
      }
      testing.assert(result, 'Empty file', callback);
      testing.success(callback);
    });
  });

  pdfStream.pipe(writeStream);
}

// Directory path as input, writing to file using fs.
function dirAndStream(callback) {
  var fileCombined = outDir + 'dirAndStream.pdf';
  var writeStream = fs.createWriteStream(fileCombined);
  var pdfStream = pdfmerger(resDir);

  pdfStream.on('error', function(error) {
    testing.failure(error.message, callback);
  });

  writeStream.on('error', function(error) {
    if (error) {
      testing.failure('Could not write file', callback);
    }
  });

  writeStream.on('finish', function() {
    fs.readFile(fileCombined, function(error, result) {
      if (error) {
        testing.failure('File not read', callback);
      }

      testing.assert(result, 'Empty file', callback);
      testing.success(callback);
    });
  });

  pdfStream.pipe(writeStream);
}

// Files and destination path as input
function filesAndDestPath(callback) {

  var fileCombined = outDir + 'filesAndDestPath.pdf';

  pdfmerger([pdf1, pdf2], fileCombined, {}, function(error) {
    if (error) {
      return testing.failure(error.message, callback);
    }

    fs.readFile(fileCombined, function(error, result) {
      if (error) {
        testing.failure('File not read', callback);
      }

      testing.assert(result, 'Empty file', callback);
      testing.success(callback);
    });
  });
}

// directory and destination path as input

function dirAndDestPath(callback) {

  var fileCombined = outDir + 'dirAndDestPath.pdf';

  pdfmerger(resDir, fileCombined, {}, function(error) {
    if (error) {
      return testing.failure(error.message, callback);
    }

    fs.readFile(fileCombined, function(error, result) {
      if (error) {
        testing.failure('File not read', callback);
      }
      testing.assert(result, 'Empty file', callback);
      testing.success(callback);
    });
  });
}

// -- Should fail ----------------------------------------------------------------------------------

// file not found

function fileNotFoundStream(callback) {

  var pdfStream = pdfmerger([pdf1, 'abcdefghijklmnopqrstuvwxyz0123456789.pdf']);

  pdfStream.on('error', function(error) {
    testing.contains(error, 'Error: File not found or accessible', callback);
    testing.success(callback);
  });

}

function fileNotFound(callback) {

  var fileCombined = outDir + 'fileNotFound.pdf';

  pdfmerger([pdf1, 'abcdefghijklmnopqrstuvwxyz0123456789.pdf'], fileCombined, {}, function(error) {
    testing.contains(error.message, 'Error: File not found or accessible', callback);
    testing.success(callback);
  });
}

// not enough input files

function invalidAmountOfInputFiles(callback) {

  var fileCombined = outDir + 'fileNotFound.pdf';

  try {
    pdfmerger([pdf1]);
  } catch(error) {
    testing.contains(error.message, 'must be at least 2 paths in the source array', callback);
    testing.success(callback);
  }
}

// not a valid input directory

function dirNotFound(callback) {

  var pdfStream = pdfmerger('abcdefghijklmnopqrstuvwxyz0123456789');

  pdfStream.on('error', function(error) {
    testing.contains(error, 'The provided directory path is not a directory', callback);
    testing.success(callback);
  });

}

function dirIsFile(callback) {

  var pdfStream = pdfmerger(pdf1);

  pdfStream.on('error', function(error) {
    testing.contains(error, 'The provided directory path is not a directory', callback);
    testing.success(callback);
  });

}

// not a valid output directory
function outputDirNotFound(callback) {

  pdfmerger([pdf1, pdf2], '/abcdefghijklmnopqrstuvwxyz0123456789/test.pdf', {}, function(error) {
    testing.contains(error.message, 'Output file path not accessible', callback);
    testing.success(callback);
  });

}

// not sufficient amount of pdfs in input directory
function dirIsEmpty(callback) {

  var pdfStream = pdfmerger(singleDir);

  pdfStream.on('error', function(error) {
    testing.contains(error, 'Missing sources', callback);
    testing.success(callback);
  });

}

exports.test = function(callback) {
    var tests = [
      // Should pass
      filesAndStream,
      dirAndStream,
      filesAndDestPath,
      dirAndDestPath,
      maxAndMinHeap,

      // Should fail
      fileNotFoundStream,
      fileNotFound,
      invalidAmountOfInputFiles,
      dirNotFound,
      dirIsFile,
      outputDirNotFound,
      dirIsEmpty
    ];
    testing.run(tests, 30000, callback);
};

// run tests if invoked directly
if (__filename == process.argv[1]) {
  function cleanupAndShow(err, res) {
    trash([outDir + '*']).then(() => {
      testing.show(err, res);
    });
  }

  mkdirp(outDir, function (err) {
    if (err) {
      throw err;
    }

    exports.test(cleanupAndShow);
  });
}
