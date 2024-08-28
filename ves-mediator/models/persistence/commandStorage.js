var storage = require('node-persist');



function setFaultThrottleSpec(throttleSpec) {

    console.log('Storing fault spec:\n', JSON.stringify(throttleSpec));
    try {
        storage.setItemSync('faultThrottleSpec', throttleSpec);
    } catch (error) {
        console.log("Can not store throttle specification. error: " + error);
        throw error;
    }
}


function getFaultThrottleSpec() {

    var throttleSpec = storage.getItemSync("faultThrottleSpec");
    return throttleSpec;
}


module.exports={
    setFaultThrottleSpec:setFaultThrottleSpec,
    getFaultThrottleSpec:getFaultThrottleSpec
}