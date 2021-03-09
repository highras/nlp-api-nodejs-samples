'use strict'

const crypto = require('crypto');
const https = require('https');

let HOST = "asr.ilivedata.com";
let URI = "/api/v1/speech/recognize/result";
let PROJECT_ID = "YOUR_PROJECT_ID_GOES_HERE";
let SECRET_KEY = "YOUR_SECRET_KEY_GOES_HERE";

function createSign(data, key) {
    var hmac = crypto.createHmac("sha256", key);
    return hmac.update(data).digest("base64");
}

function sendHttpRequest(sign, paramsJson, nowDate, callback) {
    var options = {
        hostname: HOST,
        port: 443,
        path: URI,
        method: 'POST',
        headers: {
            'X-AppId': PROJECT_ID,
            'X-TimeStamp': nowDate,
            'Content-type': "application/json",
            'Authorization': sign,
            'Host': HOST,
            'Connection': 'keep-alive'
        }
    };

    var req = https.request(options, (res) => {
        res.on('data', (d) => {
            callback(d.toString(), null);
        });
    });

    req.on('error', (e) => {
        callback(null, e);
    });

    req.write(paramsJson);
    req.end();
}

function get_result(taskId, callback) {

    var queryBodyJson = "{\"taskId\": \"" + taskId + "\"}";

    var nowDate = new Date().toISOString().replace(/\..+/, '') + 'Z';

    var stringToSign = "POST\n"
        + HOST + "\n"
        + URI + "\n"
        + crypto.createHash('sha256').update(queryBodyJson).digest('hex') + "\n"
        + "X-AppId:" + PROJECT_ID + "\n"
        + "X-TimeStamp:" + nowDate;

    var sign = createSign(stringToSign, SECRET_KEY);
    sendHttpRequest(sign, queryBodyJson, nowDate, callback);
}

var taskId = "us_b5d0c173-96e8-47b1-879c-d9444512ea12_1615195987742";

get_result(taskId, function (result, error) {
    if (!error) {
        console.log(result);
    } else
        console.log(error);
});