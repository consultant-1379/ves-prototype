function handleErr(e) {
    if (isMediatorDefinedError(e)) {
        console.log(e.toString());
        return;
    }

    if (e.code === 'ECONNREFUSED') {
        console.log(e);
        console.log("!!!Can not connect with DCAE through VES interface. Is DCAE runing and you config the correct IP and Port?");
        return;
    }

    console.log("Unexpected error happens. Error: " + e);
    console.log("Call stack is: " + e.stack);
    throw e;    
}

function isMediatorDefinedError(e) {
    if ((e instanceof FieldCanNotMapException) || (e instanceof UnknowTopicException)) {
        return true;
    }
    else return false;
}

class FieldCanNotMapException {
    constructor(eriFieldValue, mappingFunctionName) {
        this.eriFieldValue = eriFieldValue;
        this.functionName = mappingFunctionName;
    }

    toString() {
        return "ERROR: Function \"" + this.functionName + "\" can not do the map for: " + this.eriFieldValue;
    }
}

class UnknowTopicException {
    constructor(topic) {
        this.topic = topic;
    }

    toString() {
        return "Received unknown topic : " + this.topic;
    }
}

module.exports = {
    handleErr: handleErr,
    FieldCanNotMapException: FieldCanNotMapException,
    UnknowTopicException: UnknowTopicException
}              