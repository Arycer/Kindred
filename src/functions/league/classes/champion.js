const get_emote = require('../fetch/get_emote');
const fetch = require('node-fetch');

class Champion {
    constructor() {
        this.name = null;
        this.key = null;
        this.id = null;
        this.emote = null;
    }

    async get_champion(query) {
        var endpoint = `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json`;
        var response = await fetch(endpoint);
        var json = await response.json();
        var champs = Object.values(json);
        if (typeof query === 'number') {
            var champ = champs.find(champ => champ.key == query);
        } else {
            var champ = champs.find(champ => champ.name.toLowerCase() == query.toLowerCase());
        }
        if (!champ) return;
        this.name = champ.name;
        this.key = champ.key;
        this.id = champ.id;
        this.emote = get_emote(champ.key);

        return this;
    }
}

module.exports = Champion;