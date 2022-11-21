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
        var endpoint = `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json`;

        return axios.get(endpoint).then(async response => {
            var champions = Object.values(response.data);

            if (typeof query === 'number') {
                var champion = champions.find(champion => champion.id == query);
            } else {
                var champion = champions.find(champion => champion.key.toLowerCase() == query.toLowerCase());
            }

            if (champion) {
                this.name = champion.name;
                this.key = champion.key;
                this.id = champion.id;
                this.emote = get_emote(champion.key);
                return this;
            }
        });
    }
}

module.exports = Champion;