var rspHandler = require('../models/vesResponseHanding/vesResponseHandler');
var msgSender = require('../models/vesMsgSender/msgSender');
var assert = require('chai').assert;
var fs = require('fs');


describe('PM handling tests', () => {


  it('Positive ROP file deletion test:', () => {

    // Make sure local directory exists
    if (!fs.existsSync('test/testdir')) {
      fs.mkdirSync('test/testdir');
    }

    // Copy test ROP files to local ROP storage
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test1.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test1.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test2.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test2.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test3.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test3.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test4.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test4.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test5.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test5.xml'));

    let filesToDelete = ["test/testdir/A20170922.1055+0000-1056+0000_test1.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test2.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test3.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test4.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test5.xml"];

    let res = { statusCode: 202 };
    return rspHandler.handleVesPmResponse(res, null, filesToDelete)
      .then(() => {
        // Check that all files are removed
        console.dir('checking files');
        assert.isNotOk(fs.existsSync('test/testdir/A20170922.1055+0000-1056+0000_test1.xml'),
          'test/testdir/A20170922.1055+0000-1056+0000_test1.xml is not deleted');
        assert.isNotOk(fs.existsSync('test/testdir/A20170922.1055+0000-1056+0000_test2.xml'),
          'test/testdir/A20170922.1055+0000-1056+0000_test2.xml is not deleted');
        assert.isNotOk(fs.existsSync('test/testdir/A20170922.1055+0000-1056+0000_test3.xml'),
          'test/testdir/A20170922.1055+0000-1056+0000_test3.xml is not deleted');
        assert.isNotOk(fs.existsSync('test/testdir/A20170922.1055+0000-1056+0000_test4.xml'),
          'test/testdir/A20170922.1055+0000-1056+0000_test4.xml is not deleted');
        assert.isNotOk(fs.existsSync('test/testdir/A20170922.1055+0000-1056+0000_test5.xml'),
          'test/testdir/A20170922.1055+0000-1056+0000_test5.xml is not deleted');
      })
  })

  it('Negative ROP file deletion test:', () => {

    // Make sure local directory exists
    if (!fs.existsSync('test/testdir')) {
      fs.mkdirSync('test/testdir');
    }

    // Copy test ROP files to local ROP storage
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test1.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test1.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test2.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test2.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test3.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test3.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test4.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test4.xml'));
    fs.createReadStream('test/ropFiles/A20170922.1055+0000-1056+0000_test5.xml').pipe(fs.createWriteStream('test/testdir/A20170922.1055+0000-1056+0000_test5.xml'));

    let filesToDelete = ["test/testdir/A20170922.1055+0000-1056+0000_test1.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test2.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test3.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test4.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test5.xml",
      "test/testdir/A20170922.1055+0000-1056+0000_test6.xml"]; // This file does not exist and should generate error

    let res = { statusCode: 202 };
    return rspHandler.handleVesPmResponse(res, null, filesToDelete)
      .then(() => {
        return Promise.reject('Promise succeeded unexpectedly');
      })
      .catch((error) => {
        return Promise.resolve(isError(error));
      });
  })

  function isError(e) {
    if (typeof e === 'string') {
        return Promise.reject(new Error(e));
    }
    return Promise.resolve(e);
}

});
