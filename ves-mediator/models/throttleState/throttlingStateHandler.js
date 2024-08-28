var commandStorage = require('../persistence/commandStorage');
var vesMsgSender = require('../vesMsgSender/msgSender');
const errorHandler = require('../errorHandling/errorHandler');


const mqtt = require('mqtt');
var broker = 'mqtt://localhost:1818';
var throttlingStateSender = mqtt.connect(broker, {
    clientId: 'ThrottlingState',
    clean: false,
});

function handleProvideThrottlingState() {

    console.log('Sending VES/ThrottleState to mqtt');
    throttlingStateSender.publish('VES/ThrottleState', '', {qos: 1 });

}

function handleMqttThrottleStateMsg(topic) {

    var throttleState = {};

    // Collect stored throttling specifications
    var alarmFilter = commandStorage.getFaultThrottleSpec();

    if ((alarmFilter.eventDomainThrottleSpecification.suppressedFieldNames !== undefined &&
        alarmFilter.eventDomainThrottleSpecification.suppressedFieldNames.length > 0) ||
        (alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList !== undefined &&
            alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList.length > 0)) {

        // Throttling spec exists
        throttleState = {
            'eventThrottlingState': {
                'eventThrottlingMode': 'throttled',
                'eventDomainThrottleSpecificationList': [
                    alarmFilter.eventDomainThrottleSpecification
                ]
            }
        
        }

    } else {
        // No throttling
        throttleState = {
            'eventThrottlingState': {
                'eventThrottlingMode': 'normal'
            }
        };
    }

    console.log('throttleState:\n' + JSON.stringify(throttleState));


    vesMsgSender.sendThrottleStateToVes(throttleState)
        .then((res, body) => {
            console.log('statusCode: ' + res.statusCode);  
        })
        .catch((err) => {
            errorHandler.handleErr(err);
        });

}

function sendThrottlingState() {

}

module.exports = {
    handleProvideThrottlingState: handleProvideThrottlingState,
    handleMqttThrottleStateMsg: handleMqttThrottleStateMsg
}