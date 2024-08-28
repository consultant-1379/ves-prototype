var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');

var testmsg
var msg = 'empty';

router.use(bodyParser.json());

router.route('/')
.all(function(req, res, next) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  next();
})

.post(function(req, res, next){
  var answer = 'Test message sent to http://localhost:3000/test';
  if (req.body.msg) {
    msg = req.body.msg
  }
  testmsg = { json: {msg: msg } }
  request.post(
    'http://localhost:3001/test',
    testmsg,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }
    }
  );
  res.end(answer);
})

module.exports = router;
