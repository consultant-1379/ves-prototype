
var express = require('express');
var path    = require("path");
var http = require("http");
var app  = express();

// set static directories
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
app.use('/', routes);

var port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening on port ',  port);


module.exports = app;
