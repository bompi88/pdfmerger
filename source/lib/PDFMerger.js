const path = require('path');
const { Readable } = require('stream');
const spawn = require('child_process').spawn;

class ChildStream extends Readable {

  constructor(childProcess) {
    super();

    var self = this;

    childProcess.stdout.on('data', (data) => {
      self.emit('data', data);
    });

    childProcess.stderr.on('data', (data) => {
      self.emit('error', String(data));
    });

    childProcess.on('close', (code) => {
      self.emit('close', code);
    });

    this.child = childProcess;
  }

  _read(size) {
    return this.child.stdout.read(size);
  }

  pipe(stream, options={}) {
    return this.child.stdout.pipe(stream, options);
  }
}

module.exports = function(src, dest, callback) {

  if (!(Array.isArray(src) || typeof src === 'string')) {
    throw new Error('First argument should be either a path to a directory or an array of paths to pdf source files')
  }

  if (Array.isArray(src) && src.length < 2) {
    throw new Error('There must be at least 2 paths in the source array');
  }

  const dirPathArr = __dirname.split(path.sep);

  dirPathArr.pop();
  dirPathArr.pop();
  dirPathArr.push('jar');
  dirPathArr.push('pdfmerger.jar');

  const jarPath = dirPathArr.join(path.sep);

  const childArgs = [
    '-jar',
    jarPath
  ];

  const sources = Array.isArray(src) ? src : [src];

  // set all sources
  for (let source of sources) {
    childArgs.push('-s');
    childArgs.push(source);
  }

  // set output file path
  if (dest) {
    childArgs.push('-o');
    childArgs.push(dest);
  }

  const child = spawn('java', childArgs);

  let e = 0;

  if (dest) {

    child.stderr.on('data', (data) => {
      e++;
      child.kill('SIGINT');
      // TODO: better error handling/messages
      callback && callback(new Error(String(data)));
    });

    child.on('close', (code) => {
      if (e === 0 && code === 1) {
        return callback && callback(new Error('PDFBox shut down because of a problem.'));
      }

      callback && e === 0 && callback(null);
    });

    return this;
  }

  return new ChildStream(child);
};
