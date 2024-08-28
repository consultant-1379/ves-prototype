const errorHandler = require('../../errorHandling/errorHandler');
const VesPmEvent = require('../../vesEvent/vesPmEvent').VesPmEvent;
const eri2VesPmTranslator = require('../../pm/pmTranslator/eri2VesPmTranslator');
const cheerio = require('cheerio');


function getVesPmEvent(xmlData, counterFilterArray) {
    const $ = cheerio.load(xmlData);
    const localDn = $('measData managedElement').attr('localdn');

    const beginTime = $('fileHeader measCollec').attr('begintime');
    const endTime = $('fileFooter measCollec').attr('endtime');
    const beginEpochMicrosec = Date.parse(beginTime) * 1000;
    const endEpochMicrosec = Date.parse(endTime) * 1000;

    const countersAndValues = getCountersAndValue($, counterFilterArray);

    return new VesPmEvent(localDn, beginEpochMicrosec, endEpochMicrosec, countersAndValues);
}

function getCountersAndValue($, counterFilterArray) {
    let counterAndValuePairs = new Map();
    $('measData measInfo').each((index, measInfo) => {
        getCountersAndValueFromMeasInfo($, measInfo, counterAndValuePairs, counterFilterArray);
    });
    return counterAndValuePairs;
}

function getCountersAndValueFromMeasInfo($, measInfo, counterAndValuePairs, counterFilterArray) {
    var measObjLdn = $(measInfo).find('measValue').attr('measobjldn');

    let counterAndIdPairs = new Array();
    $(measInfo).find('measType').each((index, measType) => {
        if (counterFilterArray.indexOf($(measType).text()) >= 0) //Only add counters matching filter
        {
            getCounterAndIdFromMeasType($, measType, counterAndIdPairs);
        }
    });
    let idAndValueMap = new Map();
    $(measInfo).find('measValue r').each((index, counterVaule) => {
        getIdAndVauleFromMeasValue($, counterVaule, idAndValueMap);
    });

    for (let [counter, id] of counterAndIdPairs) {
        counterAndValuePairs.set(measObjLdn + '_' + counter, idAndValueMap.get(id));
    }
}

function getIdAndVauleFromMeasValue($, counterVaule, idAndValueMap) {
    idAndValueMap.set($(counterVaule).attr('p'), $(counterVaule).text());
}

function getCounterAndIdFromMeasType($, measType, counterAndIdPairs) {
    counterAndIdPairs.push([$(measType).text(), $(measType).attr('p')]);
}

module.exports = {
    getVesPmEvent: getVesPmEvent
}