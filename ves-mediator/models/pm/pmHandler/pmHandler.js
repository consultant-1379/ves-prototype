let msgSender = require('../../vesMsgSender/msgSender');
let pmTranslator = require('../pmTranslator/eri2VesPmTranslator');
let vesResponseHandler = require('../../vesResponseHanding/vesResponseHandler');
let errorHandler = require('../../errorHandling/errorHandler');


async function handleRopFiles(ropFiles) {

    // convert provides comma separated string to array
    let ropFileArr = ropFiles.split(',');


    for (ropFile of ropFileArr) {

        await pmTranslator.generateVesPmEventPromise(ropFile)
            .then((vesPmEventJson) => {
                msgSender.sendEventToVes(vesPmEventJson)
            })
            .then((res, body) => {
                vesResponseHandler.handleVesPmResponse(res, body, [ropFile]);
            })
            .catch((err) => {
                errorHandler.handleErr(err);
            });
    }
}

module.exports = {
    handleRopFiles: handleRopFiles
};