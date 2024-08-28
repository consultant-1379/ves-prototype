const fs = require('fs');
const path = require('path');
const xmlRopParser = require('../models/pm/pmTranslator/xmlRopParser');
const eri2VesPmTranslator = require('../models/pm/pmTranslator/eri2VesPmTranslator');
const errorHandler = require('../models/errorHandling/errorHandler');
var assert = require('chai').assert;



describe('PM counter parse test:', () => {

    let xmlFile;
    describe('xml jquery test:', () => {
        it('load the PM xml file', (done) => {
            fs.readFile(path.join(__dirname, 'pmExample.xml'), 'utf-8', (err, data) => {
                if (err) {
                    throw err;
                }
                xmlFile = data;
                done();
            });
        });

        it('generate VES PM event', () => {
            const vesPmEvent = xmlRopParser.getVesPmEvent(xmlFile, []);
            assert.strictEqual(vesPmEvent.event.commonEventHeader.eventId, 'ManagedElement=1', "eventId should be ManagedElement=1");
        });

        it('vesPmEvent to Json string', () => {
            const ropFilePath = path.join(__dirname, 'pmExample.xml');
            console.log(ropFilePath);
            eri2VesPmTranslator.generateVesPmEventPromise(ropFilePath)
            .then((vesPmEventJson) => {
                assert.strictEqual(vesPmEventJson.event.commonEventHeader.version, 2, "Version should be 2");
                assert.strictEqual(vesPmEventJson.event.commonEventHeader.eventId, "ManagedElement=1", "EventId should be ManagedElement=1");                
            })
            .catch((err) =>{
                errorHandler.handleErr(err);
            });            
        });
    });
});