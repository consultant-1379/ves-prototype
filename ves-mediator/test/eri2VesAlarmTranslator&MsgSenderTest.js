var translator = require('../models/translator/eri2VesAlarmTranslator');
var msgSender = require('../models/vesMsgSender/msgSender');
var probableCauseMapper = require('../models/translator/probableCauseMapper');
var sourceReportEntityNameMapper = require('../models/translator/source&reportEntityNameMapper');
var assert = require('assert');
const eventTypeMapper = require('../models/translator/eventTypeMapper');
const testSeverity = require('../models/translator/severityMapper');



describe('Ves alarm translator test:', () => {
  var dummyEriAlarm = {
    "notificationType": "eriAlarmMajor",
    "eriAlarmActiveManagedObject": "ManagedElement=sgsn1302,SgsnMme=1,PIU=1.1,FaultId=104444241",
    "eriAlarmActiveMajorType": "193",
    "eriAlarmActiveMinorType": "4239786141",
    "eriAlarmActiveSpecificProblem": "depPIUConnectionLost",
    "eriAlarmActiveLastSequenceNo": "483",
    "eriAlarmActiveEventType": "5",
    "eriAlarmActiveEventTime": "1413378172000000",
    "eriAlarmActiveProbableCause": "100514",
    "eriAlarmNObjAdditionalText": "The connection with the <EqId> is lost or can´t be established",
    "eriAlarmNObjMoreAdditionalText": "2",
    "eriAlarmNObjResourceId": "2",
    "eriAlarmNObjAdditionalInfo": "Fake additional info"
  };

  describe('translator test:', () => {
    it('dummy eriAlarm to vesAlarm', () => {
      var VesAlarm = translator.eriAlarm2VesAlarm(dummyEriAlarm);
      console.log("ejuncui, VesAlarm is: " + JSON.stringify(VesAlarm));
      assert.strictEqual(VesAlarm.event.faultFields.specificProblem, "depPIUConnectionLost");
    });

    it('map probable cause from int to str', () => {
      assert.strictEqual(probableCauseMapper.getProbableCause("100514"), "equipmentMalfunction");
    });
    it('get Source name from MO', () => {
      assert.strictEqual(sourceReportEntityNameMapper.getRdnFromMo("ManagedElement=sgsn1302,SgsnMme=1,PIU=1.1,FaultId=104444241"), "sgsn1302");
    });

    it('map probable cause failed', () => {
      probableCauseMapper.getProbableCause("1273782138789218912983");
    });



  });

  describe('VES msg sender test', () => {
    var dummyVesAlarm = {
      "event": {
        "commonEventHeader": {
          "version": 2.0,
          "domain": "fault",
          "eventName": "Fault_pmSupThresholdCrossedWar",
          "eventId": "pmSupThresholdCrossedWar_ManagedElement=sgsn1302,SgsnMme=1,PIU=2.1,FaultId=10444482430",
          "sequence": 0,
          "priority": "Normal",
          "reportingEntityName": "sgsn1302",
          "sourceName": "sgsn1302",
          "startEpochMicrosec": 1413378172000000,
          "lastEpochMicrosec": 1413378172000000
        },
        "faultFields": {
          "faultFieldsVersion": 2,
          "alarmCondition": "thresholdCrossed",
          "eventSourceType": "ManagedElement=sgsn1302,SgsnMme=1,PIU=2.1,FaultId=10444482430",
          "specificProblem": "pmSupThresholdCrossedWar",
          "eventSeverity": "NORMAL",
          "vfStatus": "Active",
          "alarmAdditionalInformation": [
            {
              "name": "alarmAdditionalText",
              "value": "Updating additionalText: The new value of measurement type SYS.gsnApCpuUsagenhas reached its threshold"
            },
            {
              "name": "alarmAdditionalInfo",
              "value": "The fake additional info"
            }
          ]
        }
      }
    };

  });

  function deapthFirstSearch(node)
  {
    for(var key in node){
      if (node.hasOwnProperty(key)){
        var element = node[key];
        if(element !== null && typeof element === "object"){
          console.log("this is object and the key is: " + key);
          deapthFirstSearch(element);
        }
        else{
          // Do something here for the search.
          console.log("this is key and value" + key + ': ' + element);
        }
      }
    }
  }

  /*describe('Translator & VES msg sender test', () => {
  });*/

  describe('test eventType mapping from integer to string:', () => {
    it('EventType 1 should map to OTHER', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(1);
      assert.equal(eventTypeStr, 'OTHER');
    });
    it('EventType 2 should map to COMMUNICATIONSALARM', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(2);
      assert.equal(eventTypeStr, 'COMMUNICATIONSALARM');
    });
    it('EventType 3 should map to QUALITYOFSERVICEALARM', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(3);
      assert.equal(eventTypeStr, 'QUALITYOFSERVICEALARM');
    });
    it('EventType 4 should map to PROCESSINGERRORALARM', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(4);
      assert.equal(eventTypeStr, 'PROCESSINGERRORALARM');
    });
    it('EventType 5 should map to EQUIPMENTALARM', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(5);
      assert.equal(eventTypeStr, 'EQUIPMENTALARM');
    });
    it('EventType 6 should map to ENVIRONMENTALALARM', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(6);
      assert.equal(eventTypeStr, 'ENVIRONMENTALALARM');
    });
    it('EventType 7 should map to INTEGRITYVIOLATION', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(7);
      assert.equal(eventTypeStr, 'INTEGRITYVIOLATION');
    });
    it('EventType 8 should map to OPERATIONALVIOLATION', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(8);
      assert.equal(eventTypeStr, 'OPERATIONALVIOLATION');
    });
    it('EventType 9 should map to PHYSICALVIOLATION', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(9);
      assert.equal(eventTypeStr, 'PHYSICALVIOLATION');
    });
    it('EventType 10 should map to SECURITYSERVICEORMECHANISMVIOLATION', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(10);
      assert.equal(eventTypeStr, 'SECURITYSERVICEORMECHANISMVIOLATION');
    });
    it('EventType 11 should map to TIMEDOMAINVIOLATION', () => {
      var eventTypeStr = eventTypeMapper.getEventTypeStr(11);
      assert.equal(eventTypeStr, 'TIMEDOMAINVIOLATION');
    });
  });
    describe('Test severity mapping from EriAlarm MIB to VES:', () => {
    it('alarmCleared should map to NORMAL', () => {
      let notificationType2Severity = testSeverity.notificationType2Severity('eriAlarmCleared');
      assert.equal(notificationType2Severity, 'NORMAL');
    });
    it('alarmCritical should map to CRITICAL', () => {
      let notificationType2Severity = testSeverity.notificationType2Severity('eriAlarmCritical');
      assert.equal(notificationType2Severity, 'CRITICAL');
    });
    it('alarmMajor should map to MAJOR', () => {
      let notificationType2Severity = testSeverity.notificationType2Severity('eriAlarmMajor');
      assert.equal(notificationType2Severity, 'MAJOR');
    });
    it('alarmMinor should map to MINOR', () => {
      let notificationType2Severity = testSeverity.notificationType2Severity('eriAlarmMinor');
      assert.equal(notificationType2Severity, 'MINOR');
    });
    it('alarmWarning should map to WARNING', () => {
      let notificationType2Severity = testSeverity.notificationType2Severity('eriAlarmWarning');
      assert.equal(notificationType2Severity, 'WARNING');
    });
  });
});