const get_emote = require('../functions/get_emote');
const axios = require('axios');

class Champion {
    constructor() {
        this.name = null;
        this.key = null;
        this.id = null;
        this.emote = null;
    }

    async get_champion(query) {
        var endpoint = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_es/v1/champion-summary.json`;

        var response = await axios.get(endpoint);
        var data = response.data;

        var champions = Object.values(data);

        if (isNaN(query)) {
            var search = query.split(' ').join('').split("'").join('').toLowerCase();
            var champion = champions.find(c => c.alias == search || c.name.split(' ').join('').split("'").join('') == search);
        } else {
            var champion = champions.find(c => c.id == query);
        }

        if (!champion) return null;

        this.name = champion.name;
        this.key = champion.alias;
        this.id = champion.id;
        this.emote = get_emote(champion.alias);

        return this;
    }
}

module.exports = Champion;