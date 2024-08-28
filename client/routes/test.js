var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.route('/')
.all(function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    next();
})
.post(function(req, res, next){
    console.log('---- Msg ----\n' + JSON.stringify(req.body, null, 2));
    res.end('Msg received');
})

module.exports = router;
