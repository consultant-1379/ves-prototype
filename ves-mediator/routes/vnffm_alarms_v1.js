var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');

router.use(bodyParser.json());

router.route('/')
.all(function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    next();
})

.get(function(req,res,next){
  var answer = 'This will use Netconf down to COM to get the active alarm list';
  res.end(answer);
})

module.exports = router;
