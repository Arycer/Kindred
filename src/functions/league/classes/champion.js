const fetch = require('node-fetch');

class Champion {
    constructor() {
        this.name = null;
        this.key = null;
        this.id = null;
    }

    async get_champion(query) {
        var ver_endpoint = `https://ddragon.leagueoflegends.com/api/versions.json`;
        var ver_response = await fetch(ver_endpoint);
        var ver_json = await ver_response.json();
        var version = ver_json[0];

        var champ_endpoint = `http://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/champion.json`;
        var champ_response = await fetch(champ_endpoint);
        var champ_json = await champ_response.json();
        var champs = Object.values(champ_json.data);
        if (typeof query === 'number') {
            var champ = champs.find(champ => champ.key == query);
        } else {
            var champ = champs.find(champ => champ.name.toLowerCase() == query.toLowerCase());
        }
        if (!champ) return;
        this.name = champ.name;
        this.key = champ.key;
        this.id = champ.id;
        return this;
    }
}

module.exports = Champion;