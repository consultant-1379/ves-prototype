var util = require('util');
var storage = require('node-persist');
storage.initSync({ dir: './persistent_storage' });

var defaultCfg = {};
defaultCfg.vnfIp = "172.17.0.2";
defaultCfg.snmpAgentPort = "161";
defaultCfg.snmpTrapListenerPort = "1620"
defaultCfg.vesPort = "30000"
defaultCfg.vesIp = "127.0.0.1";
defaultCfg.sourcename = "";
defaultCfg.sourceId = "";
defaultCfg.pmPort = "22";
defaultCfg.pmCounterFilter = [];
defaultCfg.pmRopInterval = "60";
defaultCfg.pmRopPath = "./PerformanceManagementReportFiles"
defaultCfg.sftpUsername = "root"
defaultCfg.sftpPasswd = "linux"
defaultCfg.vesUsername = "ves_mediator"
defaultCfg.vesPasswd = "1234"



const LAST_SEQUENCE_NO = "lastSequenceNo";

//console.log("defaultCfg=" + util.inspect(defaultCfg, false, null));

if (storage.length() == 0) {
    storage.setItemSync('mediatorConfig', defaultCfg);
    storage.setItemSync(LAST_SEQUENCE_NO, 0);

    //console.log("Stored: " + util.inspect(storage.getItemSync("mediatorConfig"), false, null));
}


function getConfig() {
    var cfg = storage.getItemSync("mediatorConfig");
    return cfg;
}

function putConfig(cfg) {
    storage.setItemSync('mediatorConfig', cfg);
}

function getSequenceNo() {
    var sequenceNo = storage.getItemSync(LAST_SEQUENCE_NO);
    if (sequenceNo === undefined) {
        sequenceNo = 0;
    }
    return sequenceNo;
}

function setSequenceNo(lastSequentNo) {
    try {
        storage.setItemSync(LAST_SEQUENCE_NO, lastSequentNo);
    } catch (error) {
        console.log("Can not set the last sequence number. error: " + error);
        throw error;
    }
}

function clearSequenceNo() {
    storage.clearSync(LAST_SEQUENCE_NO);
}



module.exports={
    clearSequenceNo:clearSequenceNo,
    setSequenceNo:setSequenceNo,
    getSequenceNo:getSequenceNo,
    putConfig:putConfig,
    getConfig:getConfig
}


