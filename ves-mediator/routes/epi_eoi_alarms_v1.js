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

.post(function(req, res, next) {

  var answer = 'Missing parameters...';

  if (req.body.managedObject &&
      req.body.majorType &&
      req.body.minorType &&
      req.body.specificProblem &&
      req.body.lastSequenceNo &&
      req.body.eventType &&
      req.body.eventTime &&
      req.body.probableCause &&
      req.body.additionalText &&
      req.body.severity) {

    if (req.app.locals.settings) {

      answer = 'Alarm sent to ' + req.app.locals.uri + ' on format ' + req.app.locals.type + ' ' + req.app.locals.version;

      var msg;

      if (req.app.locals.type === 'ONAP') {

        console.log('creating ONAP');
        msg = {
          json: {
            event: {
              commonEventHeader: {
                version: '1:1',
                domain: 'fault',
                eventType: '-- missing (no)--',
                eventId: req.body.lastSequenceNo,
                sourceId: '-- missing (no) --',
                sourceName: '-- missing (yes) --',
                functionalRole: '-- missing (yes) --',
                reportingEntityId: '-- missing (yes) - uuid we have dn/xpath --',
                reportingEntityName: '-- missing (no) --',
                priority: '-- missing (yes) --',
                startEpochMicrosec: '-- missing (yes) --',
                lastEpochMicrosec: req.body.eventTime,
                sequence: req.body.lastSequenceNo
              },
              faultFields: {
                faultFieldsVersion: '1:1',
                eventSeverity: req.body.severity,
                eventSourceType: '-- missing (yes) --',
                alarmCondition: '-- missing (yes) --',
                specificProblem: req.body.specificProblem,
                vfStatus: '-- missing (yes) --',
                alarmInterfaceA: req.body.managedObject,
                alarmAdditionalInformation: req.body.additionalText
              }
            }
          }
        }

      } else { // it is VNF

        if (req.body.severity == 'cleared') { // AlarmClearedNotification

          msg = {
            json: {
              id: '-- missing (yes) --',
              notificationType: 'AlarmClearedNotification',
              subscriptionId: '-- missing (yes) --',
              timestamp: '-- missing (yes) --',
              alarmId: '-- missing (yes) --',
              alarmClearedTime: '-- missing (yes) --'
            }
          }

        } else { // AlarmNotification

          msg = {
            json: {
              id: '-- missing (yes) --',
              notificationType: 'AlarmNotification',
              subscriptionId: '-- missing (yes) --',
              timestamp: '-- missing (yes) --',
              alarmId: '-- missing (yes) --',
              links: '-- missing (yes) --'
            }
          }
        }
      }


      request.post(
        req.app.locals.uri + '/eventListener/v1',
        msg,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body)
          }
        }
      );
    }
  };
  res.end(answer);
})

module.exports = router;
