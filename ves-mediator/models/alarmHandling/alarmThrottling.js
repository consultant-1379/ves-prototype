var commandStorage = require('../persistence/commandStorage');


function filterAlarm(vesAlarm) {

    // TODO: Improve performance by only reading persistence object when needed
    // Get fault throttling filter
    var alarmFilter = commandStorage.getFaultThrottleSpec();

    if (alarmFilter !== undefined) {

        //console.log('filter:\n' + JSON.stringify(alarmFilter));        
        //console.log('vesAlarm before filter:\n' + JSON.stringify(vesAlarm));

        // Remove optional fields
        if (alarmFilter.eventDomainThrottleSpecification.suppressedFieldNames !== undefined) {

            for (var j = 0; j < alarmFilter.eventDomainThrottleSpecification.suppressedFieldNames.length; j++) {
                var field = alarmFilter.eventDomainThrottleSpecification.suppressedFieldNames[j];
                console.log('suppressedFieldNames[' + j + ']: ' + field);
                delete vesAlarm.event.faultFields[field];
            }
        }

        // Remove name value pairs
        if (alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList !== undefined) {

            for (var j = 0; j < alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList.length; j++) {
                var nvListName = alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList[j].nvPairFieldName;
                console.log('suppressedNvPairsList[' + j + ']: ' + nvListName);

                for (var k = 0; k < alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList[j].suppressedNvPairNames.length; k++) {
                    var nvPairName = alarmFilter.eventDomainThrottleSpecification.suppressedNvPairsList[j].suppressedNvPairNames[k];
                    console.log('suppressedNvPairNames[' + k + ']: ' + nvPairName);

                    if (vesAlarm.event.faultFields[nvListName] !== undefined && vesAlarm.event.faultFields[nvListName] instanceof Array) {

                        console.log('Removing ' + nvPairName + ' from ' + nvListName)
                        removeByKey(vesAlarm.event.faultFields[nvListName], {
                            'key': 'name',
                            'value': nvPairName
                        });
                    } else {
                        console.log('Could not remove NvPair ' + nvPairName + ' from field ' + nvListName);
                        console.log('vesAlarm.nvListName: ' + vesAlarm.event.faultFields[nvListName]);
                        console.log('vesAlarm.nvListName instanceof Array = ' + vesAlarm.event.faultFields[nvListName] instanceof Array);

                    }
                }

            }
        }
        //console.log('vesAlarm after filter:\n' + JSON.stringify(vesAlarm));        
    }

    return vesAlarm;
}

function removeByKey(array, params){

	array.some(function(item, index) {

		if(array[index][params.key] === params.value) {

            // found it!
            console.log('Found element: ' + params.value);
			array.splice(index, 1);
			return true;
		}
		return false;
    });
    
    console.log('array after filtering:\n' + JSON.stringify(array));
	return array;
}

module.exports = {
    filterAlarm: filterAlarm
}