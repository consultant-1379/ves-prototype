var util = require('util');
var snmp = require ("net-snmp");

const mqtt = require('mqtt');
var broker = 'mqtt://localhost:1818';
var trapSender  = mqtt.connect(broker, {
    clientId: 'TrapReceiver',
    clean: false,
});

var cfg = require('../../../models/persistence/persistentStorage').getConfig();


const AAL_TABLE_OID = "1.3.6.1.4.1.193.183.4.1.3.5"; // The start OID for AAL

// Alarm table column OIDs
const ALARM_INDEX           = "1.3.6.1.4.1.193.183.4.1.3.5.1.1"
const MAJOR_OID             = "1.3.6.1.4.1.193.183.4.1.3.5.1.2"
const MINOR_OID             = "1.3.6.1.4.1.193.183.4.1.3.5.1.3"
const SPECIFIC_PROBLEM_OID  = "1.3.6.1.4.1.193.183.4.1.3.5.1.4"
const MANAGED_OBJECT_OID    = "1.3.6.1.4.1.193.183.4.1.3.5.1.5"
const EVENT_TYPE_OID        = "1.3.6.1.4.1.193.183.4.1.3.5.1.6"
const EVENT_TIME_OID        = "1.3.6.1.4.1.193.183.4.1.3.5.1.7"
const ORIG_EVENT_TIME_OID   = "1.3.6.1.4.1.193.183.4.1.3.5.1.8"
const PROBABLE_CAUSE_OID    = "1.3.6.1.4.1.193.183.4.1.3.5.1.9"
const SEVERITY_OID          = "1.3.6.1.4.1.193.183.4.1.3.5.1.10"
const ORIG_SEVERITY_OID     = "1.3.6.1.4.1.193.183.4.1.3.5.1.11"
const ADD_TEXT_OID          = "1.3.6.1.4.1.193.183.4.1.3.5.1.12"
const ORIG_ADD_TEXT_OID     = "1.3.6.1.4.1.193.183.4.1.3.5.1.13"
const RESOURCE_OID          = "1.3.6.1.4.1.193.183.4.1.3.5.1.14"
const ADD_INFO_OID          = "1.3.6.1.4.1.193.183.4.1.3.5.1.15"


function sortInt (a, b) {
    if (a > b)
        return 1;
    else if (b > a)
        return -1;
    else
        return 0;
}

function getEpochTime(octetString) {
    var year = octetString[0] * 256 + octetString[1];
    var month = octetString[2];
    var day = octetString[3];
    var hours = octetString[4];
    var minutes = octetString[5];
    var seconds = octetString[6];
    var deciSec = octetString[7];
    var dir = String.fromCharCode(octetString[8]);
    var dirHour = octetString[9];
    var dirMin = octetString[10];

    var monthStr = month.toString();
    var dayStr = day.toString();
    var hoursStr = hours.toString();
    var minutesStr = minutes.toString();
    var secondsStr = seconds.toString();
    var deciSec = deciSec.toString();
    var dirHourStr = dirHour.toString();
    var dirMinStr = dirMin.toString();

    if (monthStr.length === 1)
    {
        monthStr = "0" + monthStr;
    }
    if (dayStr.toString().length === 1)
    {
        dayStr = "0" + dayStr;
    }
    if (hoursStr.length === 1)
    {
        hoursStr = "0" + hoursStr;
    }
    if (minutesStr.length === 1)
    {
        minutesStr = "0" + minutesStr;
    }
    if (secondsStr.length === 1)
    {
        secondsStr = "0" + secondsStr;
    }
    if (dirHourStr.length === 1)
    {
        dirHourStr = "0" + dirHourStr;
    }
    if (dirMinStr.length === 1)
    {
        dirMinStr = "0" + dirMinStr;
    }
    var strDate = year + "-" + monthStr + "-" + dayStr + "T" + hoursStr + ":" + minutesStr +
        ":" + secondsStr + "." + deciSec + dir + dirHourStr + dirMinStr;

    var date = new Date(strDate);

    return date.getTime() * 1000;
}


function responseCb (error, table) {
    if (error) {
        console.error (error.toString ());
    } else {
        // This code is purely used to print rows out in index order,
        // ifIndex's are integers so we'll sort them numerically using
        // the sortInt() function above
        var indexes = [];
        for (index in table)
            indexes.push (parseInt (index));
        indexes.sort (sortInt);

        var aal = [];

        // Go through each alarm in table
        for (var i = 0; i < indexes.length; i++) {


            var columns = [];
            for (column in table[indexes[i]])
                columns.push (parseInt (column));
            // columns.sort (sortInt);

            var alarm = {};

            // Set values not available in AAL
            alarm.eriAlarmActiveLastSequenceNo   = "0"; // No sequence number in AAL, not used anyhow
            alarm.eriAlarmNObjMoreAdditionalText = "2"; // 2 means false
            alarm.eriAlarmNObjMoreAdditionalInfo = "2"; // 2 means false
            alarm.eriAlarmNObjResourceId         = "2"; // 2 means false
            alarm.eriAlarmNObjRecordType         = "0"; // Assume new alarm, i.e. 0

            console.log("Alarm id: " + indexes[i]);
            // Print index, then each column indented under the index
            for (var j = 0; j < columns.length; j++) {

                //console.log ("   column " + columns[j] + " = "
                //    + table[indexes[i]][columns[j]]);

                switch (j) {

                    case 0:
                        console.log("\teriAlarmActiveMajorType: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmActiveMajorType = table[indexes[i]][columns[j]].toString();
                        break;
                    case 1:
                        console.log("\teriAlarmActiveMinorType: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmActiveMinorType = table[indexes[i]][columns[j]].toString();
                        break;
                    case 2:
                        console.log("\teriAlarmActiveSpecificProblem: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmActiveSpecificProblem = table[indexes[i]][columns[j]].toString();
                        break;
                    case 3:
                        console.log("\teriAlarmActiveManagedObject: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmActiveManagedObject = table[indexes[i]][columns[j]].toString();
                        break;
                    case 4:
                        console.log("\teriAlarmActiveEventType: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmActiveEventType = table[indexes[i]][columns[j]].toString();
                        break;
                    case 5:
                        console.log("\teriAlarmActiveEventTime: " + getEpochTime(table[indexes[i]][columns[j]]));
                        alarm.eriAlarmActiveEventTime = getEpochTime(table[indexes[i]][columns[j]]);
                        break;
                    case 6:
                        console.log("\teriAlarmActiveOriginalEventTime: " + getEpochTime(table[indexes[i]][columns[j]]));
                        //alarm.eriAlarmActiveOriginalEventTime = getEpochTime(table[indexes[i]][columns[j]]);
                        // calculated by translator
                        break;
                    case 7:
                        console.log("\teriAlarmActiveProbableCause: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmActiveProbableCause = table[indexes[i]][columns[j]].toString();
                        break;
                    case 8:
                        switch (table[indexes[i]][columns[j]]) {
                            case 1:
                                alarm.notificationType = "eriAlarmCleared";
                                break;
                            case 2:
                                alarm.notificationType = "eriAlarmIndeterminate";
                                break;
                            case 3:
                                alarm.notificationType = "eriAlarmCritical";
                                break;
                            case 4:
                                alarm.notificationType = "eriAlarmMajor";
                                break;
                            case 5:
                                alarm.notificationType = "eriAlarmMinor";
                                break;
                            case 6:
                                alarm.notificationType = "eriAlarmWarning";
                                break;
                            default:
                                console.log("Faulty severity");
                        }
                        console.log("\teriAlarmActiveSeverity: " + alarm.notificationType);
                        break;
                    case 9:
                        switch (table[indexes[i]][columns[j]]) {
                            case 1:
                                alarm.originalNotificationType = "eriAlarmCleared";
                                break;
                            case 2:
                                alarm.originalNotificationType = "eriAlarmIndeterminate";
                                break;
                            case 3:
                                alarm.originalNotificationType = "eriAlarmCritical";
                                break;
                            case 4:
                                alarm.originalNotificationType = "eriAlarmMajor";
                                break;
                            case 5:
                                alarm.originalNotificationType = "eriAlarmMinor";
                                break;
                            case 6:
                                alarm.originalNotificationType = "eriAlarmWarning";
                                break;
                            default:
                                console.log("Faulty severity");
                        }
                        console.log("\teriAlarmActiveOriginalSeverity: " + alarm.originalNotificationType);
                        break;
                    case 10:
                        console.log("\teriAlarmActiveAdditionalText: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmNObjAdditionalText = table[indexes[i]][columns[j]].toString();
                        break;
                    case 11:
                        console.log("\teriAlarmActiveOrigAdditionalText: " + table[indexes[i]][columns[j]].toString());
                        // not needed
                        break;
                    case 12:
                        console.log("\teriAlarmActiveResourceId: " + table[indexes[i]][columns[j]].toString());
                        // not used
                        break;
                    case 13:
                        console.log("\teriAlarmActiveAdditionalInfo: " + table[indexes[i]][columns[j]].toString());
                        alarm.eriAlarmNObjAdditionalInfo = table[indexes[i]][columns[j]].toString();
                        break;
                    default:
                    // Ignore

                }
            }

            aal.push(alarm);

        }

        var jsonObj = JSON.stringify(aal);

        console.log("aalReader sends JSON object:");
        console.log(jsonObj);

        trapSender.publish('FM/AAL', jsonObj, { qos: 1 });
    }
}

exports.getAal = function() {

    var options = {
        port: cfg.snmpAgentPort,
        retries: 1,
        timeout: 500,
        transport: "udp4",
        trapPort: cfg.snmpTrapListenerPort,
        version: snmp.Version2c
    };

    console.log("Reading AAL from " + cfg.vnfIp + " on port " + cfg.snmpAgentPort);
    var session = snmp.createSession(cfg.vnfIp, "public", options);

    session.table(AAL_TABLE_OID, 20, responseCb);

}

