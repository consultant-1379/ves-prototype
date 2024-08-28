var storage = require('node-persist');
var errorHandler = require('../errorHandling/errorHandler');
var alarmUtility = require('../alarmHandling/alarmUtility');

function saveVesAlarm(vesAlarm) {

    console.log("save the alarm with key: " + alarmUtility.getVesAlarmPsKey(vesAlarm));
    storage.setItem(alarmUtility.getVesAlarmPsKey(vesAlarm), vesAlarm).catch(errorHandler.handleErr);
}

function getVesAlarms() {
    var alarms = storage.valuesWithKeyMatch(alarmUtility.ALARM_TAG);
    return alarms;
}

function deleteVesAlarm(vesAlarm) {
    
    storage.removeItemSync(alarmUtility.getVesAlarmPsKey(vesAlarm));
}



module.exports = {
    saveVesAlarm: saveVesAlarm,
    getVesAlarms: getVesAlarms,
    deleteVesAlarm: deleteVesAlarm,
}
