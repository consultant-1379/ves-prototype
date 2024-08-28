var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ropFileRetriever = require('./models/pm/ropFileRetriever/ropfileRetriever');

var routes = require('./routes/index');
var test = require('./routes/test');
var about = require('./routes/about');
var vnffm_subscriptions_v1 = require('./routes/vnffm_subscriptions_v1');
var epi_eoi_alarms_v1 = require('./routes/epi_eoi_alarms_v1');
var vnffm_alarms_v1 = require('./routes/vnffm_alarms_v1');
var mqttListener = require('./routes/mqttListener');

var snmpClient = require('./models/snmp/client/aalReader');
snmpClient.getAal();

var trapReceiver = require('./models/snmp/trapReceiver/trapReceiver');
trapReceiver.trapReceiver();

var ropScheduler = require('./models/pm/ropFileScheduler/ropScheduler');
ropScheduler.startRopScheduler();


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.text({ type: 'text/html' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/test', test);
app.use('/about', about);
app.use('/vnffm/v1/subscriptions', vnffm_subscriptions_v1);
app.use('/epi/v1/alarms', epi_eoi_alarms_v1);
app.use('/eoi/v1/alarms', epi_eoi_alarms_v1);
app.use('/vnffm/v1/alarms', vnffm_alarms_v1);
app.use('/mqttListener', mqttListener);


app.locals.settings = false;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;