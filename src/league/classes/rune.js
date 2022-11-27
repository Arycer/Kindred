const get_emote = require('../functions/get_emote');
const axios = require('axios');

class Rune {
    constructor() {
        this.name = null;
        this.id = null;
        this.emote = null;
    }

    async get_rune(id) {
        if (id == 8000 || id == 8100 || id == 8200 || id == 8300 || id == 8400) {
            var endpoint = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perkstyles.json`;

            return axios.get(endpoint).then(response => {
                var styles = Object.values(response.data.styles);
                var style = styles.find(style => style.id == id);

                if (style) {
                    this.name = style.name;
                    this.id = style.id;
                    this.emote = get_emote(this.name.split(' ').join(''));
                    return this;
                }
            });
        } else {
            var endpoint = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json`;

            return axios.get(endpoint).then(response => {
                var perks = Object.values(response.data);
                var perk = perks.find(perk => perk.id == id);

                if (perk) {
                    this.name = perk.name;
                    this.id = perk.id;
                    this.emote = get_emote(this.name.split(' ').join(''));
                    return this;
                }
            });
        }
    }
}

module.exports = Rune;