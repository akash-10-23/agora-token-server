require('dotenv').config();

const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const PORT = 8080;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const app = express();

const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

const generateAccessToken = (req,res) => {
    //set response header
    res.header('Acess-Control-Allow-Origin','*');

    //get channel name
    const channelName = req.query.channelName;
    if (!channelName) {
        return res.status(500).json({ 'error': 'channel name is required!!!' });
    }

    //get uid, role, expire time
    let uid = req.query.uid;
    if(!uid || uid == '') {
        uid = 0;
    }
  
    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
    }
    
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600; //1hour expire time by default
    } else {
        expireTime = parseInt(expireTime, 10);
    }

    //calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    //build token and return as json
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    return res.json({'token': token});
}

app.get("/access_token", nocache, generateAccessToken);

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`);
});