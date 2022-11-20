const fetch = require('node-fetch');

class Summoner {
    constructor () {
        this.summoner_id = null;
        this.account_id = null;
        this.puuid = null;
        this.name = null;
        this.profile_icon = null;
        this.icon_id = null;
        this.summoner_level = null;
        this.url = null;
    }

    async get_summoner(region, username) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();

        if (!json.id) return this;

        this.name = json.name;
        this.puuid = json.puuid;
        this.summoner_id = json.id;
        this.account_id = json.accountId;
        this.icon_id = json.profileIconId;
        this.summoner_level = json.summonerLevel;
        this.url = `https://www.leagueofgraphs.com/es/summoner/${region.name.toLowerCase()}/${json.name.split(' ').join('%20')}`;
        this.profile_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${json.profileIconId}.jpg`;
        return this;
    }
}

module.exports = Summoner;