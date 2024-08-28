const xmlRopParser = require('./xmlRopParser');
const cfg = require('../../persistence/persistentStorage').getConfig();
const fs = require('fs');


function generateVesPmEventPromise(ropFilePath) {
    let vesPmEventPromise = new Promise((resolve, reject) => {
        fs.readFile(ropFilePath, 'utf-8', (err, xmlRopData) => {
            if (err) {
                reject(err);
            }
            let vesPmEventJson = xmlRopParser.getVesPmEvent(xmlRopData, cfg.pmCounterFilter);
            resolve(vesPmEventJson);
        });
    });

    return vesPmEventPromise;
}


module.exports = {
    generateVesPmEventPromise: generateVesPmEventPromise,
};