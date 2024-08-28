class VesEvent{
    constructor(domain) {
        this.event = new Event(domain);
    }
}

class Event{
    constructor(domain) {
        this.commonEventHeader = new CommonEventHeader(domain);
    }
}

class CommonEventHeader{
    constructor(domain) {
        this.version = 2;
        this.domain = domain;
    }
}



module.exports = {
    VesEvent:VesEvent
}