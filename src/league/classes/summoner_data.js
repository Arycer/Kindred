const axios = require('axios');

class Summoner {
    constructor () {
        this.name = null;
        this.identifiers = {
            s_id: null,
            a_id: null,
            puuid: null
        };
        this.icon = {
            id: null,
            url: null
        }
        this.level = null;
    }

    get_summoner(region, username) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async res => {
                var data = res.data;
                this.name = data.name;
                this.identifiers = {
                    s_id: data.id,
                    a_id: data.accountId,
                    puuid: data.puuid
                };
                this.icon = {
                    id: data.profileIconId,
                    url: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${data.profileIconId}.jpg`
                };
                this.level = data.summonerLevel;
                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_summoner(region, username);
                }
            });
    }
}

module.exports = Summoner;