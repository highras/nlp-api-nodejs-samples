'use strict'

const crypto = require('crypto');
const https = require('https');

let HOST = "tsafe.ilivedata.com";
let URI = "/api/v1/text/check";
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

function check(text, userId, callback) {
    var paramsJson = JSON.stringify( { "content" : text, "userId" : userId } );
    var nowDate = new Date().toISOString().replace(/\..+/, '') + 'Z';
    
    var stringToSign = "POST\n"
        + HOST + "\n"
        + URI + "\n"
        + crypto.createHash('sha256').update(paramsJson).digest('hex') + "\n"
        + "X-AppId:" + PROJECT_ID + "\n"
        + "X-TimeStamp:" + nowDate;

    var sign = createSign(stringToSign, SECRET_KEY);
    sendHttpRequest(sign, paramsJson, nowDate, callback);
}

check("fuck", "12345678", function (result, error) {
    if (!error) {
        console.log(result);
    } else
        console.log(error);
});