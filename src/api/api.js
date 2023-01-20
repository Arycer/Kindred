const express = require('express');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
const port = 8443;

const app = express();

https.createServer({
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
}, app).listen(port, () => {
    console.log('La API se ha iniciado en el puerto', port);
});

var clientID = process.env.RSO_ID,
    clientSecret = process.env.RSO_Secret;

var appBaseURL = 'https://api.arycer.me/kindred',
    appSuccessURL = appBaseURL + '/success',
    appCallbackURL = appBaseURL + '/rso',
    appAuthURL = appBaseURL + '/auth';

var riotURL = 'https://auth.riotgames.com',
    authorizeURL = riotURL + '/authorize',
    userInfoURL = riotURL + '/userinfo',
    tokenURL = riotURL + '/token';

app.get('/kindred/login', function (req, res) {
    if (req.headers.authorization !== process.env.BOT_Secret) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
    }

    if (!req.query.auth) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var auth = Buffer.from(req.query.auth, 'base64').toString('ascii').split(':'),
        discordID = auth[0],
        token = auth[1];

    if (!discordID || !token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var dbEntry = db.linkedLeague.get(discordID);
    if (!dbEntry || dbEntry.token !== token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var link = appAuthURL + '?token=' + req.query.auth;
    res.status(200).send({ link: link });
});

app.get('/kindred/auth', function (req, res) {
    if (!req.query.token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var auth = Buffer.from(req.query.token, 'base64').toString('ascii').split(':'),
        discordID = auth[0],
        token = auth[1];

    if (!discordID || !token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var dbEntry = db.linkedLeague.get(discordID);
    if (!dbEntry || dbEntry.token !== token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var link = authorizeURL
        + '?redirect_uri=' + appCallbackURL
        + '&client_id=' + clientID
        + '&response_type=code'
        + '&scope=openid+cpid'
        + '&state=' + req.query.token;

    res.status(302).redirect(link);
});

app.get('/kindred/rso', async function (req, res) {
    if (!req.query.code || !req.query.state) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var auth = Buffer.from(req.query.state, 'base64').toString('ascii').split(':'),
        accessCode = req.query.code,
        discordID = auth[0],
        token = auth[1];

    if (!discordID || !token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var dbEntry = db.linkedLeague.get(discordID);
    if (!dbEntry || dbEntry.token !== token) {
        res.status(400).send({ error: 'Bad Request' });
        return;
    }

    var tokenAuth = { username: clientID, password: clientSecret },
        tokenData = new URLSearchParams();

    tokenData.append('grant_type', 'authorization_code');
    tokenData.append('redirect_uri', appCallbackURL);
    tokenData.append('code', accessCode);

    var tokenRequest = await axios.post(tokenURL, tokenData, { auth: tokenAuth }).catch(err => {
        if (err.response.status === 400) res.status(400).send({ error: 'Bad Request' });
    });
    var accessToken = tokenRequest?.data.access_token;
    if (!accessToken) return;

    var userInfoAuth = { Authorization: 'Bearer ' + accessToken };

    var userInfoRequest = await axios.get(userInfoURL, { headers: userInfoAuth }),
        cpid = userInfoRequest.data.cpid;

    var summonerApiURL = `https://${cpid}.api.riotgames.com/lol/summoner/v4/summoners/`,
        summonerName = summonerApiURL + 'by-name/',
        summonerRSO = summonerApiURL + 'me';

    var summonerRSORequest = await axios.get(summonerRSO, { headers: userInfoAuth }),
        summonerRSOData = summonerRSORequest.data;

    var summonerNameRequest = await axios.get(summonerName + summonerRSOData.name, axiosOptions),
        summonerPuuid = summonerNameRequest.data.puuid;

    db.linkedLeague.set(discordID, { puuid: summonerPuuid, region: cpid });
    res.status(302).redirect(appSuccessURL);
});

app.get('/kindred/success', function (req, res) {
    res.status(200).send("<script>window.close();</script>");
});