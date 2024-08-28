var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.route('/')
.all(function(req, res, next) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  next();
})
.get(function(req,res,next){
  var answer = 'Subscriptions\n';
  if (req.app.locals.settings) {
    answer = answer + '  URI: ' + req.app.locals.uri + '\n  Type: ' + req.app.locals.type + '\n  Version: ' + req.app.locals.version;
  } else {
    answer = answer + '  Not defined';
  }
  res.end(answer);
})

.post(function(req, res, next){

  console.log(req.body);
  var answer = 'Must have an uri parameter and can also take type & version parameters.';

  if (req.body.uri) {
    req.app.locals.settings = true;
    req.app.locals.uri = req.body.uri;

    if (req.body.type) {
      req.app.locals.type = req.body.type;
    } else {
      req.app.locals.type = 'ONAP';
    }

    if (req.body.version) {
      req.app.locals.version = req.body.version;
    } else {
      req.app.locals.version = 'v1';
    }

    answer = 'New subscription\n  URI: ' + req.app.locals.uri + '\n  Type: ' + req.app.locals.type + '\n  Version: ' + req.app.locals.version;
  }
  res.end(answer);
})

.delete(function(req, res, next){
  req.app.locals.settings=false;
  res.end('Settings deleted');
});
module.exports = router;
