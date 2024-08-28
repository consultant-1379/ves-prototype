let Client = require('ssh2');
let fs = require('fs');
let persisStorage = require('../../persistence/persistentStorage');
const cfg = persisStorage.getConfig();
const remoteDir = '.';
const localDir = './ropFileStorage';

const mqtt = require('mqtt');
let broker = 'mqtt://localhost:1818';
let ropFileCollector = mqtt.connect(broker, {
    clientId: 'ropFileCollector',
    clean: false,
});

// A valid PM file should start with A20 and end with either .xml or .xml.gz
const pmFileNameRegEx = /A20(.*)((\.xml$)|(\.xml\.gz$))/;

// Make sure local directory exists
if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir);
}


function fetchRopFile(ropEndTimeStr) {


    let conn = new Client();
    let ropEndTime = new Date(ropEndTimeStr);

    // make sure seconds are zero as we ignore seconds for ROP
    ropEndTime.setSeconds(0);

    console.log('ropEndTime: ' + ropEndTime.toUTCString());

    conn.on(
        'connect',
        function () {
            console.log("- connected");
        }
    );

    conn.on(
        'keyboard-interactive',
        function (name, instructions, instructionsLang, prompts, finish) {
            console.log('Connection :: keyboard-interactive');
            finish(['linux']);
        });

    conn.on(
        'ready',
        function () {
            console.log("- ready");

            conn.sftp(
                function (err, sftp) {
                    var ropFile = "";
                    if (err) {
                        console.log("Error, problem starting SFTP: ", err);
                        process.exit(2);
                    }

                    console.log("- SFTP started");

                    //fetch the lastest pm file
                    sftp.readdir(remoteDir, function (err, files) {

                        let filesToFetch = [];

                        if (err)
                            throw err;

                        files.forEach(function (file) {
                            if (isValidPmFile(file.filename)) {

                                // Check position 20 to decide file format
                                if (file.filename.substring(19, 20) === '.' ||
                                    file.filename.substring(19, 20) === '_') {

                                    // File name with UTC time, i.e. no offset, e.g. A20161224.1030-1045_oslo.xml
                                    // Extract end of ROP from  file name in UTC.
                                    let endOfRopTimeStr = file.filename.substring(1, 5) + '-' + file.filename.substring(5, 7) +
                                        '-' + file.filename.substring(7, 9) + 'T' + file.filename.substring(15, 17) +
                                        ':' + file.filename.substring(17, 19) + ':00-00:00';

                                    let fileEndRopTime = new Date(endOfRopTimeStr);
                                    //console.log('fileEndRopTime: ' + fileEndRopTime.toUTCString());

                                    if (ropEndTime.getTime() === fileEndRopTime.getTime()) {

                                        // File matches end ROP time, add to files to fetch
                                        filesToFetch.push(file.filename);
                                    }

                                } else if (file.filename.substring(29, 30) === '.' ||
                                    file.filename.substring(29, 30) === '_') {

                                    // File name with time offset, e.g. A20170920.1047+0000-1048+0000_oslo.xml
                                    // Extract end of ROP from  file name
                                    let endOfRopTimeStr = file.filename.substring(1, 5) + '-' + file.filename.substring(5, 7) +
                                        '-' + file.filename.substring(7, 9) + 'T' + file.filename.substring(20, 22) +
                                        ':' + file.filename.substring(22, 24) + ':00' + file.filename.substring(24, 27) + ':' +
                                        file.filename.substring(27, 29);

                                    let fileEndRopTime = new Date(endOfRopTimeStr);
                                    //console.log('fileEndRopTime: ' + fileEndRopTime.toUTCString());

                                    if (ropEndTime.getTime() === fileEndRopTime.getTime()) {

                                        // File matches end ROP time, add to files to fetch
                                        filesToFetch.push(file.filename);
                                    }

                                } else {
                                    console.log('Could not parse ROP file name: ' + file.filename);
                                }

                            }
                        });

                        filesToFetch.forEach(function (fileToFetch) {

                        });


                        let filesLeft = filesToFetch.length;

                        let filesWithPath = [];

                        for (let i = 0; i < filesToFetch.length; i++) {
                            sftp.fastGet(remoteDir + '/' + filesToFetch[i], localDir + '/' + filesToFetch[i], function (downloadError) {
                                if (downloadError) {
                                    console.error("downloadError:" + downloadError);
                                    throw downloadError;
                                }

                                //console.log('Transferred: ' + filesToFetch[i]);
                                filesWithPath.push(localDir + '/' + filesToFetch[i]);

                                if (--filesLeft === 0) {
                                    console.log('SFTP :: All ROP files transferred!');

                                    ropFileCollector.publish('PM/RopFilesReady', filesWithPath.toString(), { qos: 1 });
                                    conn.end();                   
                                }
                            });
                        }
                    })
                }
            );
        }
    );

    conn.on(
        'error',
        function (err) {
            console.log("ssh connection error: %s", err);
            conn.end();
        }
    );

    conn.on(
        'end',
        function () {
            console.log("ssh connection closed");
            //process.exit(0);
        }
    );

    conn.connect({
        host: cfg.vnfIp,
        port: cfg.pmPort,
        username: cfg.sftpUsername,
        password: cfg.sftpPasswd,
        readyTimeout: 100000,
        tryKeyboard: true //,
        //debug: console.log
    });

};

function isValidPmFile(name) {

    // return the value in the parentheses of regex
    let result = name.match(pmFileNameRegEx);
    if (result !== null) {
        // A valid ROP file
        return true;
    } else {
        // Not a ROP file
        return false;
    }
};

module.exports = {
    fetchRopFile: fetchRopFile
};
