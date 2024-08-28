var express = require('express')
var router = express.Router()


router
.get('/', function(req, res){
  var html = '<head><link rel="stylesheet" href="/stylesheets/style.css">'+
              '<h1>VES Mediator</h1>'+
              '<p>A prototype mediating between VNF and DCAE</p>'+
              '<body>TODO:Add text here<br><br>' +
             '<a href="/">top</a></body>'
  res.send(html)
})
module.exports = router
