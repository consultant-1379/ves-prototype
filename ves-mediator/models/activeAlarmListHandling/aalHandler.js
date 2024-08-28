var alarmPsAdapter = require('../persistence/alarmPsAdapter');
var alarmUtility = require('../alarmHandling/alarmUtility');

function findClearedVesAlarms(activeEriAlarmList) {
    var catchedVesAlarms = alarmPsAdapter.getVesAlarms();
    var clearedVesAlarms = [];
    for (var vesAlarm of catchedVesAlarms) {
        if (activeEriAlarmList.find((eriAlarm) => {return alarmUtility.alarmsIsEqual(eriAlarm, vesAlarm);})
             === undefined) {
            // catched VesAlarm is not in AAL. put it in the cleared Alarm list
            vesAlarm.event.faultFields.eventSeverity = "NORMAL";
            clearedVesAlarms.push(vesAlarm);
        }
    }
    return clearedVesAlarms;
}

module.exports = {
    findClearedVesAlarms:findClearedVesAlarms
}



