let persisStorage = require('../../models/persistence/persistentStorage');
const cfg = persisStorage.getConfig();
let VesAlarmEvent = require('../vesEvent/vesAlarmEvent').VesAlarmEvent;



function eriAlarm2VesAlarm(eriAlarm) {
    let vesEvent = new VesAlarmEvent(eriAlarm);

    return vesEvent;
}


module.exports = {
    eriAlarm2VesAlarm: eriAlarm2VesAlarm
};
