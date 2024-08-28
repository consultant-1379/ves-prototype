var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');
var alarmPsAdapter = require('../models/persistence/alarmPsAdapter');
var startEpochTimeStorage = require('../models/translator/startEpochTimeStorage');
var alarmHandler = require('../models/alarmHandling/alarmHandler');
var throttleStateHandler = require('../models/throttleState/throttlingStateHandler');
var ropFileFetcher = require('../models/pm/ropFileRetriever/ropfileRetriever');
var pmHandler = require('../models/pm/pmHandler/pmHandler');


var broker = 'mqtt://localhost:1818';
var client = mqtt.connect(broker, {
	clientId: 'Mediator',
	clean: false,
});
//initialize the startTime storage when mediator is boot.
startEpochTimeStorage.initializeWithVesAlarms(alarmPsAdapter.getVesAlarms());

client.on('connect', function () {
	console.log("Mediator connected to broker " + broker);
	console.log("Mediator subscribing to topics:\n\t'FM/Alarm'\n\t'FM/AAL'\n\t'VES/ThrottleState'\n\t'PM/EndOfRop'\n\t'PM/FileReady'");
	client.subscribe('FM/Alarm');
	client.subscribe('FM/AAL');
	client.subscribe('VES/ThrottleState');
	client.subscribe('PM/EndOfRop');
	client.subscribe('PM/RopFilesReady');	
});

client.on('message', function (topic, message) {
	console.log("Mediator receives: " + message.toString() + ", topic: " + topic.toString());
	var messageString = message.toString();
	if (topic === 'FM/Alarm' || topic === 'FM/AAL') {
		if (messageString.length) {
			alarmHandler.handleMqttAlarmMsg(topic, messageString)
		}
	} else if (topic === 'VES/ThrottleState') {
		throttleStateHandler.handleMqttThrottleStateMsg(topic);
	} else if (topic === 'PM/EndOfRop') {
		ropFileFetcher.fetchRopFile(messageString);
	} else if (topic === 'PM/RopFilesReady') {
		pmHandler.handleRopFiles(messageString);
	}
});

module.exports = router;