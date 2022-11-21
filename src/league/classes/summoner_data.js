const axios = require('axios');

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
            .then(response => {
                var data = response.data;
                this.name = data.name;
                this.summoner_id = data.id;
                this.account_id = data.accountId;
                this.puuid = data.puuid;
                this.icon_id = data.profileIconId;
                this.summoner_level = data.summonerLevel;
                this.url = `https://www.leagueofgraphs.com/es/summoner/${region.name.toLowerCase()}/${data.name.split(' ').join('%20')}`;
                this.profile_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${data.profileIconId}.jpg`;
                return this;
            }).catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_summoner(region, username);
                }

                if (error.response.status == 404) {
                    return 'No se ha encontrado ningún invocador con ese nombre.';
                } else {
                    return 'Ha ocurrido un error al intentar obtener los datos del invocador.';
                }
            });
    }
}

module.exports = Summoner;