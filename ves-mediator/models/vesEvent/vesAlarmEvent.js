const probableCauseMapper = require('../translator/probableCauseMapper');
const eventTypeMapper = require('../translator/eventTypeMapper');
const severityMapper = require('../translator/severityMapper');
const sourceAndReportEntityNameMapper = require('../translator/source&reportEntityNameMapper');
var FieldCanNotMapException = require('../errorHandling/errorHandler').FieldCanNotMapException;
var startEpochTimeStorage = require('../translator/startEpochTimeStorage');
let persisStorage = require('../../models/persistence/persistentStorage');
const VesEvent = require('./vesEvent').VesEvent;
const cfg = require('../../models/persistence/persistentStorage').getConfig();


class VesAlarmEvent extends VesEvent {
    constructor(eriAlarm) {
        super("fault");
        this.initializeCommonEventHeader(this.event.commonEventHeader, eriAlarm);
        this.event.faultFields = new FaultFields(eriAlarm);
    }

    initializeCommonEventHeader(commonEventHander, eriAlarm) {
        commonEventHander.eventName = "Fault_" + eriAlarm.eriAlarmActiveSpecificProblem;
        commonEventHander.eventId = eriAlarm.eriAlarmActiveSpecificProblem + '_' + eriAlarm.eriAlarmActiveManagedObject;
        commonEventHander.priority = "Normal";
        commonEventHander.lastEpochMicrosec = eriAlarm.eriAlarmActiveEventTime;
        commonEventHander.sourceName = cfg.sourceName;
        commonEventHander.sourceId = cfg.sourceId;

        commonEventHander.reportingEntityName = mapEriField2Ves(eriAlarm.eriAlarmActiveManagedObject,
            sourceAndReportEntityNameMapper.getRdnFromMo);

        commonEventHander.startEpochMicrosec = mapEriField2Ves(eriAlarm,
            startEpochTimeStorage.getAlarmStartTime);

    }

}

class FaultFields {
    constructor(eriAlarm) {
        this.faultFieldsVersion = 2.0;
        this.alarmCondition = eriAlarm.eriAlarmNObjAdditionalText;
        this.specificProblem = eriAlarm.eriAlarmActiveSpecificProblem;
        this.vfStatus = "Active";
        this.alarmInterfaceA = eriAlarm.eriAlarmActiveManagedObject;

        this.eventSourceType = mapEriField2Ves(eriAlarm.eriAlarmActiveManagedObject,
            sourceAndReportEntityNameMapper.getRdnFromMoType);

        this.eventSeverity = mapEriField2Ves(eriAlarm.notificationType,
            severityMapper.notificationType2Severity);

        const activeEventType = mapEriField2Ves(eriAlarm.eriAlarmActiveEventType,
            eventTypeMapper.getEventTypeStr);
        const probableCause = mapEriField2Ves(eriAlarm.eriAlarmActiveProbableCause,
            probableCauseMapper.getProbableCause);
        this.eventCategory = activeEventType + '_' + probableCause;
        
        if (eriAlarm.eriAlarmNObjAdditionalInfo !== undefined) {
            this.alarmAdditionalInformation = [{name:'alarmAdditionalInfo', value:eriAlarm.eriAlarmNObjAdditionalInfo}];
        }
    }

}


function mapEriField2Ves(eriField, mappingFunction) {
    var result = mappingFunction(eriField);
    //console.log("ejuncui, the result is " + result);
    if (result === undefined) {
        throw new FieldCanNotMapException(eriField, mappingFunction);
    }
    return result;
}


module.exports = {
    VesAlarmEvent: VesAlarmEvent
}