const fetch = require('node-fetch');

class Item {
    constructor() {
        this.name = null;
        this.id = null;
    }

    async get_item(id) {
        var ver_endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var ver_response = await fetch(ver_endpoint);
        var ver_json = await ver_response.json();
        var version = ver_json[0];

        var item_endpoint = `http://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/item.json`;
        var item_response = await fetch(item_endpoint);
        var item_json = await item_response.json();
        var items = Object.values(item_json.data);
        var item = items.find(item => item.image.full == `${id}.png`);
        if (!item) return;
        this.name = item.name;
        this.id = id;
        return this;
    }
}

module.exports = Item;