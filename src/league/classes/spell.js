const get_emote = require('../functions/get_emote');
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

        return axios.get(endpoint).then(response => {
            var spells = Object.values(response.data.data);
            var spell = spells.find(spell => spell.key == id);

            if (spell) {
                this.name = spell.name;
                this.id = spell.id;
                this.emote = get_emote(this.id);
                return this;
            }
        });
    }
}

module.exports = Spell;
