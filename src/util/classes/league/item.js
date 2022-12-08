const get_emote = require('../../functions/league/get_emote');
const axios = require('axios');

class Item {
    constructor() {
        this.name = null;
        this.id = null;
        this.emote = null;
    }

    async get_item(id) {
        var endpoint = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_es/v1/items.json`;

        var response = await axios.get(endpoint);
        var data = response.data;
        var items = Object.values(data);
        var item = items.find(item => item.id == id);

        if (!item) {
            this.emote = get_emote('NoItem');
            return this;
        }

        this.name = item.name;
        this.id = item.id;
        this.emote = get_emote(item.id);

        return this;
    }
}

module.exports = Item;