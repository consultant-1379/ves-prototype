var vesMsgSender = require('../vesMsgSender/msgSender');
const errorHandler = require('../errorHandling/errorHandler');
var UnknowTopicException = errorHandler.UnknowTopicException;
var alarmPsAdapter = require('../persistence/alarmPsAdapter');
var translator = require('../translator/eri2VesAlarmTranslator');
var startEpochTimeStorage = require('../translator/startEpochTimeStorage');
var responseHandler = require('../vesResponseHanding/vesResponseHandler');
var aalHandler = require('../activeAlarmListHandling/aalHandler');
var alarmThrottling = require('./alarmThrottling');

const NO_VES_ALARM_GENERATED = "noVesAlarmGenerated";


function handleMqttAlarmMsg(topic, msg) {
    var msgObj = JSON.parse(msg);

    try {
        var vesAlarms = generateVesAlarms(topic, msgObj);
        sendVesAlarms(vesAlarms);
    } catch (error) {
        errorHandler.handleErr(error);
    }
}

function sendVesAlarms(vesAlarms) {

    for (var vesAlarm of vesAlarms) {
        vesMsgSender.sendEventToVes(vesAlarm)
            .then((res, body) => {
                responseHandler.handleVesFaultReponse(res, body, vesAlarm);
            })
            .catch((err) => {
                errorHandler.handleErr(err);
            });
    }
}

function generateVesAlarms(topic, msgObj) {
    if (topic === 'FM/Alarm') {
        var vesAlarm = generateSingleVesAlarm(msgObj);
        if (vesAlarm !== NO_VES_ALARM_GENERATED) {

            // Apply throttling filter
            vesAlarm = alarmThrottling.filterAlarm(vesAlarm);

            return [vesAlarm];
        } else {
            return [];
        }
    }

    if (topic === 'FM/AAL') {
        // AAL reading. First find alarms to clear then add the rest
        var vesAlarms = aalHandler.findClearedVesAlarms(msgObj);

        for (var aalAlarm of msgObj) {
            var alarm = generateSingleVesAlarm(aalAlarm);
            if (alarm !== NO_VES_ALARM_GENERATED) {

                vesAlarms.push(alarm);
            }
        }

        // Apply filter
        vesAlarms.forEach(function (element, index, theArray) {
            theArray[index] = alarmThrottling.filterAlarm(element);
        });


        return vesAlarms;
    }

    throw new UnknowTopicException(topic);
}

function generateSingleVesAlarm(eriAlarm) {
    if (isDuplicateAlarm(eriAlarm)) {
        console.log("Is the duplicate Alarm.");
        return NO_VES_ALARM_GENERATED;
    }
    // Normal trap, generate ves alarm array with one item
    var vesAlarm = translator.eriAlarm2VesAlarm(eriAlarm);
    alarmPsAdapter.saveVesAlarm(vesAlarm);
    return vesAlarm;
}

function isDuplicateAlarm(eriAlarm) {
    // Check if event with received timestamp already exists,
    // which means it's already sent
    var timeStamp = startEpochTimeStorage.getAlarmEventTime(eriAlarm);
    if (timeStamp === eriAlarm.eriAlarmActiveEventTime) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = {
    handleMqttAlarmMsg: handleMqttAlarmMsg
}