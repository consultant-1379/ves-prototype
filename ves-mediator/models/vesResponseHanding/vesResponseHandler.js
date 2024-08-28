var startEpochTimeStorage = require('../translator/startEpochTimeStorage');
var alarmPsAdapter = require('../persistence/alarmPsAdapter');
var storage = require('../persistence/commandStorage');
var throttleStateHandler = require('../throttleState/throttlingStateHandler');
var util = require('util');
var fs = require('fs');



function handleVesFaultResponse(res, body, vesAlarm) {
    console.log('statusCode: ' + res.statusCode);

    // When alarm is cleared, remove alarm from time storage to prevent
    // memory leak and faulty reuse of old timestamp
    if (vesAlarm.event.faultFields.eventSeverity === "NORMAL") {
        console.log("remove the alarm in persistence storage and the alarm times");
        startEpochTimeStorage.deleteAlarmsTimesWithVesAlarm(vesAlarm);
        alarmPsAdapter.deleteVesAlarm(vesAlarm);
    }

    handleCommandList(res);

}

function handleVesPmResponse(res, body, filesToDelete) {

    return new Promise((resolve, reject) => {

        handleCommandList(res);

        let filesLeft = filesToDelete.length;
        let deleteSuccess = true;
        let failMessage = '';

        console.log('No of files to delete: ' + filesLeft);

        // Delete processed ROP files
        filesToDelete.forEach(function (filename) {

            fs.unlink(filename, function (error) {
                if (error) {
                    console.error('Could not delete ' + filename + ', err: ' + error);
                    deleteSuccess = false;
                    failMessage += error;
                }
                console.log('Deleted ' + filename);

                if (--filesLeft === 0) {

                    if (deleteSuccess) {
                        // All files deleted
                        console.log('All files deleted');
                        resolve();
                    } else {
                        // Some file was not deleted
                        console.error('Failed: ' + failMessage);
                        reject(new Error(failMessage));
                    }
                }
            });
        });

    })
}

function handleCommandList(response) {

    // Handle command list in response
    if (response !== undefined && response.body !== undefined && response.body.commandList !== undefined) {

        console.log('res.body.commandList.lenght: ' + response.body.commandList.length);

        for (var i = 0; i < response.body.commandList.length; i++) {

            var commandObj = response.body.commandList[i];

            if (commandObj.command.commandType === 'throttlingSpecification' &&
                commandObj.command.eventDomainThrottleSpecification.eventDomain === 'fault') {

                // Store fault throttle specification
                storage.setFaultThrottleSpec(commandObj.command);

            } else if (commandObj.command.commandType === 'provideThrottlingState') {

                // DCAE asks for the throttling state
                throttleStateHandler.handleProvideThrottlingState();

            } else {
                console.log('Unsupported command type: ' + commandObj.command.commandType);
            }

        }

    }
}



module.exports = {
    handleVesFaultReponse: handleVesFaultResponse,
    handleVesPmResponse: handleVesPmResponse
}