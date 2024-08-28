var express = require('express');
var router = express.Router();
var config = require('../models/persistence/persistentStorage');
var cfg = config.getConfig();
var restartCmd = __dirname + '/../bin/mediator.sh restart'

function normalizeIp(ip) {
    tokens = ip.trim().split('.')
    if (tokens.length != 4) {
        return null
    }
    numArray = []
    for (var ix in tokens) {
        if (isNaN(tokens[ix])) {
            return null
        }
        var num = Number(tokens[ix])
        if (num < 0 || num > 255) {
            return null
        }
        numArray.push(num)
    }
    if (Number(tokens[0]) == 0) {
        return null
    }
    return numArray.join('.')
}

function normalizePort(port) {
    if (isNaN(port.trim())) {
        return null
    }
    var num = Number(port.trim())
    if (num < 0 || num > 65535) {
        return null
    }
    return num.toString()
}

//GET INDEX PAGE
router.get('/', function (req, res, next) {
    res.render('index', { title: 'VES Mediator' });
});

//GET CFG
router.get('/cfg', function (req, res) {
    res.json({
        "vnfIp": cfg.vnfIp, "snmpAgentPort": cfg.snmpAgentPort, "snmpTrapListenerPort": cfg.snmpTrapListenerPort,
        "pmPort": cfg.pmPort, "sourceName": cfg.sourceName, "sourceId": cfg.sourceId, "vesIp": cfg.vesIp,
        "vesPort": cfg.vesPort,"pmCounterFilter": cfg.pmCounterFilter, "pmRopInterval": cfg.pmRopInterval,
        "pmRopPath": cfg.pmRopPath, "sftpUsername": cfg.sftpUsername, "sftpPasswd": cfg.sftpPasswd,
        "vesUsername": cfg.vesUsername, "vesPasswd": cfg.vesPasswd
    });
});

//POST CFG
router.post('/cfg', function (req, res) {
    var vesIp = normalizeIp(req.body.vesIp)
    if (!vesIp) {
        console.log("Invalid VES IP address")
        return res.status(400).send({
            message: 'Invalid VES IP address ' + req.body.vesIp
        });
    }
    var vesPort = normalizePort(req.body.vesPort.toString())
    if (!vesPort) {
        console.log("Invalid VES port")
        return res.status(400).send({
            message: 'Invalid VES port ' + req.body.vesPort
        });
    }

    var snmpTrapListenerPort = normalizePort(req.body.snmpTrapListenerPort)
    if (!snmpTrapListenerPort) {
        console.log("Invalid Mediator trap listener port")
        return res.status(400).send({
            message: 'Invalid Mediator trap listener port ' + req.body.snmpTrapListenerPort
        });
    }

    var vnfIp = normalizeIp(req.body.vnfIp)
    if (!vnfIp) {
        console.log("Invalid VNF IP address")
        return res.status(400).send({
            message: 'Invalid VNF IP address ' + req.body.vnfIp
        });
    }

    var snmpAgentPort = normalizePort(req.body.snmpPort.toString())
    if (!snmpAgentPort) {
        console.log("Invalid VNF SNMP agent port")
        return res.status(400).send({
            message: 'Invalid VNF SNMP agent port ' + req.body.snmpAgentPort
        });
    }

    var sourceName = req.body.sourceName.toString()
    if (!sourceName) {
        console.log("Invalid entity name")
        return res.status(400).send({
            message: 'Invalid entity name ' + req.body.sourceName
        });
    }

    var sourceId = req.body.sourceId.toString()
    if (!sourceId) {
        console.log("Invalid entity ID")
        return res.status(400).send({
            message: 'Invalid entity ID ' + req.body.sourceId
        });
    }

    var pmPort = normalizePort(req.body.pmPort);
    if (!pmPort) {
        console.log("Invalid PM port.");
        return res.status(400).send({
            message: 'Invalid PM port ' + req.body.pmPort
        });
    }

    var pmCounterFilter = new Array(req.body.pmCounterFilter.length);
    for (i in req.body.pmCounterFilter) {
        pmCounterFilter[i] = req.body.pmCounterFilter[i].name;
    }

    if (!pmCounterFilter) {
        console.log("Invalid PM counter filter.");
        return res.status(400).send({
            message: 'Invalid PM counter filter ' + req.body.pmCounterFilter
        });
    }

    var pmRopInterval = req.body.pmRopInterval.toString();
    if (!pmRopInterval) {
        console.log("Invalid PM counter ROP interval.");
        return res.status(400).send({
            message: 'Invalid PM ROP interval ' + req.body.pmRopInterval
        });
    }

    var pmRopPath = req.body.pmRopPath.toString();
    if (!pmRopPath) {
        console.log("Invalid PM counter ROP path.");
        return res.status(400).send({
            message: 'Invalid PM ROP path ' + req.body.pmRopPath
        });
    }

    var sftpUsername = req.body.sftpUsername.toString();
    if (!sftpUsername) {
        console.log("Invalid SFTP username.");
        return res.status(400).send({
            message: 'Invalid SFTP username ' + req.body.sftpUsername
        });
    }

    var sftpPasswd = req.body.sftpPasswd.toString();
    if (!sftpPasswd) {
        console.log("Invalid SFTP password.");
        return res.status(400).send({
            message: 'Invalid SFTP password'
        });
    }

    var vesUsername = req.body.vesUsername.toString();
    if (!vesUsername) {
        console.log("Invalid VES username.");
        return res.status(400).send({
            message: 'Invalid VES username ' + req.body.vesUsername
        });
    }

    var vesPasswd = req.body.vesPasswd.toString();
    if (!vesPasswd) {
        console.log("Invalid VES password.");
        return res.status(400).send({
            message: 'Invalid VES password'
        });
    }

    // received values are probably ok so assign the new values
    cfg.vnfIp = vnfIp;
    cfg.snmpAgentPort = snmpAgentPort;
    cfg.snmpTrapListenerPort = snmpTrapListenerPort;
    cfg.vesIp = vesIp;
    cfg.vesPort = vesPort;
    cfg.sourceName = sourceName;
    cfg.sourceId = sourceId;
    cfg.pmPort = pmPort;
    cfg.pmCounterFilter = pmCounterFilter;
    cfg.pmRopInterval = pmRopInterval;
    cfg.pmRopPath = pmRopPath;
    cfg.sftpUsername = sftpUsername;
    cfg.sftpPasswd = sftpPasswd;
    cfg.vesUsername = vesUsername;
    cfg.vesPasswd = vesPasswd;
    

    config.putConfig(cfg)
    config.setSequenceNo(0);

    return res.status(200).send({
        message: 'Success'
    });

})

//POST restart mediator
router.post('/restart', function (req, res) {
    const execSync = require('child_process').execSync;
    var cmd = execSync(restartCmd)
    return res.status(200).send({
        message: 'Mediator re-started'
    });
})


module.exports = router;
