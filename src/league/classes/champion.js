const get_emote = require('../functions/get_emote');
const axios = require('axios');

class Champion {
    constructor() {
        this.name = null;
        this.key = null;
        this.id = null;
        this.emote = null;
    }

    get_champion(query) {
        var endpoint = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_es/v1/champion-summary.json`;

        return axios.get(endpoint).then(async response => {
            var champions = Object.values(response.data);

            if (typeof query === 'number') {
                var champion = champions.find(champion => champion.id == query);
            } else {
                var champion = champions.find(champion => champion.alias.toLowerCase() == query.toLowerCase());
            }

            this.name = champion.name;
            this.key = champion.alias;
            this.id = champion.id;
            this.emote = get_emote(this.key);

            return this;
        });
    }
}

module.exports = Champion;