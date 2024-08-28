const fs = require('fs');
const path = require('path');
const xmlRopParser = require('../models/pm/pmTranslator/xmlRopParser');
const eri2VesPmTranslator = require('../models/pm/pmTranslator/eri2VesPmTranslator');
const errorHandler = require('../models/errorHandling/errorHandler');
var assert = require('chai').assert;


describe('PM Filter Counter test:', () => {

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
        it('Test VesPmEvent to fetch only the counters filtered :', () => {
            const vesPmEvent = xmlRopParser.getVesPmEvent(xmlFile, ['pmActiveUeDlMax', 'pmActiveUeDlSum']);
            let cfilterArray = vesPmEvent.event.otherField.nameValuePairs;
            for (let namevalue of cfilterArray) {
                let re = new RegExp(/pmActiveUeDlMax$|pmActiveUeDlSum$/);
                assert.isTrue(re.test(namevalue.name), "should end with any of pmActiveUeDlMax', 'pmActiveUeDlSum ");
            }
        });
    });
});