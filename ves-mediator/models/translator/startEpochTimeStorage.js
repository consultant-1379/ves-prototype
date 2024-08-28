
var util = require('util');
var alarmUtility = require('../alarmHandling/alarmUtility');

var alarmTimesMap = new Map();

function saveAlarmTimesFromEriAlarm(eriAlarm) {
    const alarmKey = alarmUtility.getAlarmKeyFromEriAlarm(eriAlarm);
    const lastEventTime = eriAlarm.eriAlarmActiveEventTime;
    let startEventTime = 0;
    // only save the new Alarm's time as start time(original time)
    if (alarmTimesMap.has(alarmKey)) {
        startEventTime = alarmTimesMap.get(alarmKey).startEventTime;
    } else {
        startEventTime = lastEventTime;
    }

    console.log("Alarm times to storage: lastEventTime = " + lastEventTime + " startEventTime = " + startEventTime);
    alarmTimesMap.set(alarmKey, { lastEventTime, startEventTime });
}

function getAlarmStartTime(eriAlarm) {
    saveAlarmTimesFromEriAlarm(eriAlarm);
    const eventId = eriAlarm.eriAlarmActiveSpecificProblem + "_" + eriAlarm.eriAlarmActiveManagedObject;
    return alarmTimesMap.get(eventId).startEventTime;
}

// Returns last event time if alarm exists, or 0 if not exists
function getAlarmEventTime(eriAlarm) {
    const eventId = eriAlarm.eriAlarmActiveSpecificProblem + "_" + eriAlarm.eriAlarmActiveManagedObject;
    if (alarmTimesMap.has(eventId)) {
        console.log("returning lastEventTime = " + alarmTimesMap.get(eventId).lastEventTime);
        return alarmTimesMap.get(eventId).lastEventTime;
    } else {
        console.log("returning lastEventTime = 0");
        return 0;
    }
}


function saveAlarmTimesFromVesAlarm(vesAlarm) {
    const alarmKey = alarmUtility.getAlarmKeyFromVesAlarm(vesAlarm);
    const lastEventTime = vesAlarm.event.commonEventHeader.lastEpochMicrosec;
    const startEventTime = vesAlarm.event.commonEventHeader.startEpochMicrosec;
    console.log("Alarm times to storage: lastEventTime = " + lastEventTime + " startEventTime = " + startEventTime);
    alarmTimesMap.set(alarmKey, { lastEventTime, startEventTime });
}

function initializeWithVesAlarms(vesAlarms) {
    for (const vesAlarm of vesAlarms) {
        saveAlarmTimesFromVesAlarm(vesAlarm);
    }
}

function deleteAlarmTimesWithVesAlarm(vesAlarm) {
    return alarmTimesMap.delete(alarmUtility.getAlarmKeyFromVesAlarm(vesAlarm));
}


module.exports = {
    initializeWithVesAlarms: initializeWithVesAlarms,
    deleteAlarmsTimesWithVesAlarm: deleteAlarmTimesWithVesAlarm,
    getAlarmEventTime: getAlarmEventTime,
    getAlarmStartTime: getAlarmStartTime
}
