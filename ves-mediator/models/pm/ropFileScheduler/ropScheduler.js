var scheduler = require('node-schedule');
var cfg = require('../../persistence/persistentStorage').getConfig();
var util = require('util');


const mqtt = require('mqtt');
var broker = 'mqtt://localhost:1818';
var ropFileScheduler = mqtt.connect(broker, {
    clientId: 'RopFileScheduler',
    clean: false,
});

function startRopScheduler() {

    console.log('cfg.pmRopInterval: ' + cfg.pmRopInterval);

    var rule = new scheduler.RecurrenceRule();


    // Set rule pattern
    switch (cfg.pmRopInterval) {
        case 'OneDay':
            rule.dayOfWeek = new scheduler.Range(0, 6, 1); // once a day at 24.00
            break;
        case 'TwelveHour':
            rule.hour = new scheduler.Range(0, 23, 12); // twice a day at 12.00 and 24.00
            break;
        case 'OneHour':
            rule.hour = new scheduler.Range(0, 59, 1);
            break;
        case 'ThirtyMin':
            rule.minute = new scheduler.Range(0, 59, 30);
            break;
        case 'FifteenMin':
            rule.minute = new scheduler.Range(0, 59, 15);
            break;
        case 'FiveMin':
            rule.minute = new scheduler.Range(0, 59, 5);
            break;
        case 'OneMin':
            rule.minute = new scheduler.Range(0, 59, 1);
            break;
        default:
            console.error('Invalid ROP: ' + cfg.pmRopInterval + ', using 15 which is default');

    }


    //console.log('Schedule job: ' + util.inspect(rule, false, null));


    var j = scheduler.scheduleJob(rule, function () {
        reportEndOfRop();
    });

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reportEndOfRop() {

    var rop = new Date();
    await sleep(50000); // Wait 50 sec for file to be written
    console.log('Sending PM/EndOfRop for rop ' + rop + 'at ' + new Date());
    ropFileScheduler.publish('PM/EndOfRop', rop.toUTCString(), { qos: 1 });

} 

module.exports = {
    startRopScheduler: startRopScheduler
};