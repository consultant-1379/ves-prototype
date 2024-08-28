
const VesEvent = require('./vesEvent').VesEvent;
const cfg = require('../../models/persistence/persistentStorage').getConfig();



class VesPmEvent extends VesEvent {
    constructor(localDn, startEpochMicrosec, lastEpochMicrosec, counterValuePairs) {
        super("other");
        this.initializeCommonEventHeader(this.event.commonEventHeader, localDn, startEpochMicrosec, lastEpochMicrosec);
        this.event.otherField = new PmField(2, counterValuePairs);
    }

    initializeCommonEventHeader(commonEventHeader, localDn, startEpochMicrosec, lastEpochMicrosec) {
        commonEventHeader.eventName = 'PM' + '_' + localDn;
        commonEventHeader.eventId = localDn;
        commonEventHeader.reportingEntityName = localDn;
        commonEventHeader.priority = "Low";
        commonEventHeader.startEpochMicrosec = startEpochMicrosec;
        commonEventHeader.lastEpochMicrosec = lastEpochMicrosec;
        commonEventHeader.sourceName = cfg.sourceName;
        commonEventHeader.sourceId = cfg.sourceId;
    }

}

class PmField {
    constructor(otherFieldVersion, counterValuePairs) {
        this.otherFieldVersion = otherFieldVersion;
        if (counterValuePairs !== undefined) {
            this.nameValuePairs = [];
            for (const [counterName, counterValue] of counterValuePairs) {
                this.nameValuePairs.push(new NameValuePairs(counterName, counterValue));

            }
        }
    }
}
class NameValuePairs {
    constructor(counterName, counterValue) {
        this.name = counterName;
        this.value = counterValue;
    }
};

module.exports = {
    VesPmEvent: VesPmEvent
}