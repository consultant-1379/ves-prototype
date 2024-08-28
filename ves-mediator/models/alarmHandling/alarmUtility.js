const ALARM_TAG = "PsVesAlarmTag_";


function getAlarmKeyFromVesAlarm(vesAlarm) {
    return vesAlarm.event.faultFields.specificProblem + "_" + vesAlarm.event.faultFields.eventSourceType;
}

function getAlarmKeyFromEriAlarm(eriAlarm) {
    return eriAlarm.eriAlarmActiveSpecificProblem + "_" + eriAlarm.eriAlarmActiveManagedObject;
}


function getVesAlarmPsKey(vesAlarm) {
    return ALARM_TAG + vesAlarm.event.faultFields.specificProblem + "_" + vesAlarm.event.faultFields.eventSourceType;
}

function alarmsIsEqual(eriAlarm, vesAlarm) {
    if (getAlarmKeyFromEriAlarm(eriAlarm) === getAlarmKeyFromVesAlarm(vesAlarm)
        && eriAlarm.eriAlarmActiveEventTime === vesAlarm.event.commonEventHeader.lastEpochMicrosec) {
        return true;
    }
    else return false;
}

module.exports = {
    getAlarmKeyFromVesAlarm: getAlarmKeyFromVesAlarm,
    getAlarmKeyFromEriAlarm: getAlarmKeyFromEriAlarm,
    getVesAlarmPsKey: getVesAlarmPsKey,
    alarmsIsEqual: alarmsIsEqual,
    ALARM_TAG:ALARM_TAG
}