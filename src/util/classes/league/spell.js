const get_emote = require('../../functions/league/get_emote');
const axios = require('axios');

class Spell {
    constructor() {
        this.name = null
        this.id = null
        this.emote = null
    }

    async get_spell(id) {
        var endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var version = await axios.get(endpoint);
        version = version.data[0];

        var endpoint = `http://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/summoner.json`;

        var response = await axios.get(endpoint);
        var data = response.data;
        var spells = Object.values(data.data);
        var spell = spells.find(spell => spell.key == id);

        if (!spell) return null;

        this.name = spell.name;
        this.id = spell.id;
        this.emote = get_emote(spell.id);

        return this;
    }
}

module.exports = Spell;
