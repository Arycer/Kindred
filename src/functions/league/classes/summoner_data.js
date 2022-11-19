const fetch = require('node-fetch');

class Summoner {
    constructor () {
        this.summoner_id = null;
        this.account_id = null;
        this.puuid = null;
        this.name = null;
        this.profile_icon = null;
        this.summoner_level = null;
        this.opgg = null;
    }

    async get_summoner(username) {
        var endpoint = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();

        var ver_endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var ver_response = await fetch(ver_endpoint);
        var ver_json = await ver_response.json();
        var version = ver_json[0];

        this.summoner_id = json.id;
        this.account_id = json.accountId;
        this.puuid = json.puuid;
        this.name = json.name;
        this.profile_icon = `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${json.profileIconId}.png`;
        this.summoner_level = json.summonerLevel;
        this.opgg = `https://euw.op.gg/summoner/userName=${json.name.split(' ').join('%20')}`;
        return this;
    }
}

module.exports = Summoner;