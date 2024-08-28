let request = require('request');
let persisStorage = require('../../models/persistence/persistentStorage');
const errorHandler = require('../errorHandling/errorHandler');
const cfg = persisStorage.getConfig()



function sendEventToVes(postBody) {
  let sendMsgPromise = new Promise((resolve, reject) => {
    addSequenceNo(postBody);
    let options = createSendOptions(postBody,
      '/vendor_event_listener/eventListener/v3/example_vnf');

    request(options, function (err, res, body) {
      if (err) {
        reject(err);
      }
      else {
        resolve(res, body);
      }
    });
  });

  return sendMsgPromise;
}

function sendThrottleStateToVes(postBody) {
  let sendMsgPromise = new Promise((resolve, reject) => {
    let options = createSendOptions(postBody,
      '/vendor_event_listener/eventListener/v3/clientThrottlingState');

    request(options, function (err, res, body) {
      if (err) {
        reject(err);
      }
      else {
        resolve(res, body);
      }
    });
  });

  return sendMsgPromise;
}

function createSendOptions(postBody, resource) {
  let url = ' http://' + cfg.vesIp + ':' + cfg.vesPort
    + resource;
  let username = cfg.vesUsername;
  let password = cfg.vesPasswd;
  let options = {
    method: 'post',
    body: postBody,
    json: true,
    url: url,
    headers: {
      'Authorization': ('Basic ' + new Buffer(username + ':' + password).toString('base64'))
    }
  };

  return options;
}

function addSequenceNo(postBody) {
  let sequenceNo = persisStorage.getSequenceNo();
  postBody.event.commonEventHeader.sequence = ++sequenceNo;
  persisStorage.setSequenceNo(sequenceNo);
}

module.exports = {
  sendEventToVes: sendEventToVes,
  sendThrottleStateToVes: sendThrottleStateToVes
};