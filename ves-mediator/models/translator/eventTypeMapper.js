function getEventTypeStr(eriProbableCauseInt) {

    switch (Number(eriProbableCauseInt)) {
        case 1:
            return 'OTHER';
        case 2:
            return 'COMMUNICATIONSALARM';
        case 3:
            return 'QUALITYOFSERVICEALARM';
        case 4:
            return 'PROCESSINGERRORALARM';
        case 5:
            return 'EQUIPMENTALARM';
        case 6:
            return 'ENVIRONMENTALALARM';
        case 7:
            return 'INTEGRITYVIOLATION';
        case 8:
            return 'OPERATIONALVIOLATION'
        case 9:
            return 'PHYSICALVIOLATION';
        case 10:
            return 'SECURITYSERVICEORMECHANISMVIOLATION'
        case 11:
            return 'TIMEDOMAINVIOLATION';
        default:
            console.error('Invalid eventType: ' + eriProbableCauseInt);
            return '';
    }

}


module.exports = {
    getEventTypeStr:getEventTypeStr
}; 