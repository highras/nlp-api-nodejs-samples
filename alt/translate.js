'use strict'

const crypto = require('crypto');
const https = require('https');

let HOST = "translate.ilivedata.com";
let URI = "/api/v2/translate";
let PROJECT_ID = "YOUR_PROJECT_ID_GOES_HERE";
let SECRET_KEY = "YOUR_SECRET_KEY_GOES_HERE";

function createSign(data, key) {
    var hmac = crypto.createHmac("sha256", key);
    return hmac.update(data).digest("base64");
}

function sendHttpRequest(sign, body, callback) {
    var options = {
        hostname: HOST,
        port: 443,
        path: URI,
        method: 'POST',
        headers: {
            'Authorization': sign,
            'Content-type': "application/x-www-form-urlencoded"
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

    req.write(body);
    req.end();
}

function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

function translate(source, target, sentence, callback) {
    var params = new Map();
    params.set("q", sentence);
    params.set("source", source);
    params.set("target", target);
    params.set("timeStamp", new Date().toISOString().replace(/\..+/, '') + 'Z');
    params.set("appId", PROJECT_ID);

    params = new Map([...params.entries()].sort()); // sort

    var stringToSign = "POST\n"
        + HOST + "\n"
        + URI + "\n";

    var body = "";
    var i = 0;
    for (let [key, value] of params) {
        if (i++ > 0)
            body += "&";
        body += fixedEncodeURIComponent(key) + "=" + fixedEncodeURIComponent(value);
    }
    stringToSign += body;
    var sign = createSign(stringToSign, SECRET_KEY);
    sendHttpRequest(sign, body, callback);
}

translate("en", "zh-CN", "Hello World!", function (result, error) {
    if (!error) {
        console.log(result);
    } else
        console.log(error);
});

translate("ja", "en", "こんにちは", function (result, error) {
    if (!error)
        console.log(result);
    else
        console.log(error);
});