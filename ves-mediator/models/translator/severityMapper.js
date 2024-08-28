const severityMap = new Map([
    ["eriAlarmCleared", "NORMAL"],
    ["eriAlarmCritical", "CRITICAL"],
    ["eriAlarmMajor", "MAJOR"],
    ["eriAlarmMinor", "MINOR"],
    ["eriAlarmWarning", "WARNING"]
])



function notificationType2Severity(notificationType) {
    //console.log("ejuncui, do Severity mapping");
    return severityMap.get(notificationType);
}




module.exports = {
    notificationType2Severity:notificationType2Severity
};