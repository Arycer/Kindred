const axios = require('axios');

class Item {
    constructor() {
        this.name = null;
        this.id = null;
    }

    async get_item(id) {
        var endpoint = `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/items.json`;

        return axios.get(endpoint).then(response => {
            var items = Object.values(response.data);
            var item = items.find(item => item.id == id);

            if (item) {
                this.name = item.name;
                this.id = item.id;
                return this;
            }
        });
    }
}

module.exports = Item;