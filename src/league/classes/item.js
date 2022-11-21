const fetch = require('node-fetch');

class Item {
    constructor() {
        this.name = null;
        this.id = null;
    }

    async get_item(id) {
        var endpoint = `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/items.json`;
        var response = await fetch(endpoint);
        var json = await response.json();
        var items = Object.values(json);
        var item = items.find(item => item.id == id);
        if (!item) return;
        this.name = item.name;
        this.id = id;
        return this;
    }
}

module.exports = Item;