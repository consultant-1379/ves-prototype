var util = require('util');
var snmp = require('snmpjs');

const mqtt = require('mqtt');
var broker = 'mqtt://localhost:1818';
var trapSender = mqtt.connect(broker, {
    clientId: 'TrapReceiver',
    clean: false,
});

var cfg = require('../../../models/persistence/persistentStorage').getConfig();
var aalReader = require('../client/aalReader');


// Trap identifiers
const TRAP_OID = "1.3.6.1.6.3.1.1.4.1.0"; // The OID identifiying the received trap
// containing one of the below OID values
const ALARM_INDETERMINATE_OID = "1.3.6.1.4.1.193.183.4.2.0.1";
const ALARM_WARNING_OID = "1.3.6.1.4.1.193.183.4.2.0.2";
const ALARM_MINOR_OID = "1.3.6.1.4.1.193.183.4.2.0.3";
const ALARM_MAJOR_OID = "1.3.6.1.4.1.193.183.4.2.0.4";
const ALARM_CRITICAL_OID = "1.3.6.1.4.1.193.183.4.2.0.5";
const ALARM_CLEAR_OID = "1.3.6.1.4.1.193.183.4.2.0.7";
const APPEND_INFO_OID = "1.3.6.1.4.1.193.183.4.2.0.8";
const ALARM_LIST_REBUILT_OID = "1.3.6.1.4.1.193.183.4.2.0.30";

// Alarm trap content
const MANAGED_OBJECT_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.5/
const MAJOR_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.2/
const MINOR_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.3/
const SPECIFIC_PROBLEM_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.4/
const SEQUENCE_OID = /^1.3.6.1.4.1.193.183.4.1.3.3/
const EVENT_TYPE_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.6/
const EVENT_TIME_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.7/
const PROBABLE_CAUSE_OID = /^1.3.6.1.4.1.193.183.4.1.3.5.1.9/
const ADD_TEXT_OID = /^1.3.6.1.4.1.193.183.4.1.2.1/
const MORE_ADD_TEXT_OID = /^1.3.6.1.4.1.193.183.4.1.2.2/
const RESOURCE_OID = /^1.3.6.1.4.1.193.183.4.1.2.3/
const ADD_INFO_OID = /^1.3.6.1.4.1.193.183.4.1.2.4/
const MORE_ADD_INFO_OID = /^1.3.6.1.4.1.193.183.4.1.2.5/
const RECORD_TYPE_OID = /^1.3.6.1.4.1.193.183.4.1.2.6/
const ADD_INFO_APPEND_OID = /^1.3.6.1.4.1.193.183.4.1.2.7/ // only used in append trap



function startTrapReceiver() {

    var trapd = snmp.createTrapListener();

    trapd.on('trap', function (msg) {

        var snmpTrap = snmp.message.serializer(msg)['pdu'];
        //console.log(util.inspect(snmpTrap, false, null));

        var sendTrap = true;
        var trapObj = {};

        for (var i = 0; i < snmpTrap.varbinds.length; i++) {

            switch (snmpTrap.varbinds[i].oid) {
                case TRAP_OID:
                    switch (snmpTrap.varbinds[i].string_value) {
                        case ALARM_INDETERMINATE_OID:
                            trapObj.notificationType = "eriAlarmIndeterminate";
                            break;
                        case ALARM_WARNING_OID:
                            trapObj.notificationType = "eriAlarmWarning";
                            break;
                        case ALARM_MINOR_OID:
                            trapObj.notificationType = "eriAlarmMinor";
                            break;
                        case ALARM_MAJOR_OID:
                            trapObj.notificationType = "eriAlarmMajor";
                            break;
                        case ALARM_CRITICAL_OID:
                            trapObj.notificationType = "eriAlarmCritical";
                            break;
                        case ALARM_CLEAR_OID:
                            trapObj.notificationType = "eriAlarmCleared";
                            break;
                        case APPEND_INFO_OID:
                            trapObj.notificationType = "eriAlarmAppendInfo";
                            break;
                        case ALARM_LIST_REBUILT_OID:
                            // Trigger retrieval of AAL
                            aalReader.getAal();
                            sendTrap = false;
                            break;
                        default:
                            // Not handled trap
                            sendTrap = false;

                    }
                    break;
                case (snmpTrap.varbinds[i].oid.match(MANAGED_OBJECT_OID) || {}).input:
                    trapObj.eriAlarmActiveManagedObject = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(MAJOR_OID) || {}).input:
                    trapObj.eriAlarmActiveMajorType = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(MINOR_OID) || {}).input:
                    trapObj.eriAlarmActiveMinorType = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(SPECIFIC_PROBLEM_OID) || {}).input:
                    trapObj.eriAlarmActiveSpecificProblem = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(SEQUENCE_OID) || {}).input:
                    trapObj.eriAlarmActiveLastSequenceNo = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(EVENT_TYPE_OID) || {}).input:
                    trapObj.eriAlarmActiveEventType = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(EVENT_TIME_OID) || {}).input:

                    var year = snmpTrap.varbinds[i].value[0] * 256 + snmpTrap.varbinds[i].value[1];
                    var month = snmpTrap.varbinds[i].value[2];
                    var day = snmpTrap.varbinds[i].value[3];
                    var hours = snmpTrap.varbinds[i].value[4];
                    var minutes = snmpTrap.varbinds[i].value[5];
                    var seconds = snmpTrap.varbinds[i].value[6];
                    var deciSec = snmpTrap.varbinds[i].value[7];
                    var dir = String.fromCharCode(snmpTrap.varbinds[i].value[8]);
                    var dirHour = snmpTrap.varbinds[i].value[9];
                    var dirMin = snmpTrap.varbinds[i].value[10];

                    var monthStr = month.toString();
                    var dayStr = day.toString();
                    var hoursStr = hours.toString();
                    var minutesStr = minutes.toString();
                    var secondsStr = seconds.toString();
                    var deciSec = deciSec.toString();
                    var dirHourStr = dirHour.toString();
                    var dirMinStr = dirMin.toString();

                    if (monthStr.length === 1) {
                        monthStr = "0" + monthStr;
                    }
                    if (dayStr.toString().length === 1) {
                        dayStr = "0" + dayStr;
                    }
                    if (hoursStr.length === 1) {
                        hoursStr = "0" + hoursStr;
                    }
                    if (minutesStr.length === 1) {
                        minutesStr = "0" + minutesStr;
                    }
                    if (secondsStr.length === 1) {
                        secondsStr = "0" + secondsStr;
                    }
                    if (dirHourStr.length === 1) {
                        dirHourStr = "0" + dirHourStr;
                    }
                    if (dirMinStr.length === 1) {
                        dirMinStr = "0" + dirMinStr;
                    }
                    var strDate = year + "-" + monthStr + "-" + dayStr + "T" + hoursStr + ":" + minutesStr +
                        ":" + secondsStr + "." + deciSec + dir + dirHourStr + dirMinStr;

                    var date = new Date(strDate);

                    // console.log("strDate: " + strDate);
                    // console.log("date: " + date);
                    // console.log("Epoch in millis: " + date.getTime());

                    trapObj.eriAlarmActiveEventTime = date.getTime() * 1000; // convert to micros
                    break;
                case (snmpTrap.varbinds[i].oid.match(PROBABLE_CAUSE_OID) || {}).input:
                    trapObj.eriAlarmActiveProbableCause = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(ADD_TEXT_OID) || {}).input:
                    trapObj.eriAlarmNObjAdditionalText = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(MORE_ADD_TEXT_OID) || {}).input:
                    trapObj.eriAlarmNObjMoreAdditionalText = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(RESOURCE_OID) || {}).input:
                    trapObj.eriAlarmNObjResourceId = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(ADD_INFO_OID) || {}).input:
                    trapObj.eriAlarmNObjAdditionalInfo = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(MORE_ADD_INFO_OID) || {}).input:
                    trapObj.eriAlarmNObjMoreAdditionalInfo = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(RECORD_TYPE_OID) || {}).input:
                    trapObj.eriAlarmNObjRecordType = snmpTrap.varbinds[i].string_value;
                    break;
                case (snmpTrap.varbinds[i].oid.match(ADD_INFO_APPEND_OID) || {}).input:
                    trapObj.eriAlarmNObjAppendedAdditionalInfo = snmpTrap.varbinds[i].string_value;
                    break;

                default:
                // Skip unknown parameter;
            }
        }

        if (sendTrap) {
            var jsonObj = JSON.stringify(trapObj);

            console.log("trapReceiver sends JSON object:");
            console.log(trapObj);

            trapSender.publish('FM/Alarm', jsonObj, { qos: 1 });

        } else {
            //console.log("Not a valid trap");
        }

    });

    console.log("Listening for traps on port " + cfg.snmpTrapListenerPort);
    trapd.bind({ family: 'udp4', port: Number(cfg.snmpTrapListenerPort) });

}

module.exports = {
    trapReceiver: startTrapReceiver
};
