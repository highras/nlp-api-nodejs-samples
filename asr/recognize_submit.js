'use strict'

const crypto = require('crypto');
const https = require('https');

let HOST = "asr.ilivedata.com";
let URI = "/api/v1/speech/recognize/submit";
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

function recognize(audioUrl, languageCcode, userId, speakerDiarization, callback) {
    let codeC = "PCM";
    let sampleRateHertz = "16000";

    var queryBodyJson = "{\"languageCode\": \"" + languageCcode + "\", \"diarizationConfig\": {\"enableSpeakerDiarization\": " + speakerDiarization + "}, \"config\": {\"codec\": \"" + codeC + "\", \"sampleRateHertz\": " + sampleRateHertz + "}, \"uri\": \"" + audioUrl + "\", \"userId\": \"" + userId + "\"}";

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

var audioUrl = "https://rcs-us-west-2.s3.us-west-2.amazonaws.com/test.wav";

recognize(audioUrl, "zh-CN", "12345678", true, function (result, error) {
    if (!error) {
        console.log(result);
    } else
        console.log(error);
});