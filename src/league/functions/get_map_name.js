const axios = require('axios');

async function get_map_name(id, lang) {
    var endpoint = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/${lang=='en-US' ? 'default' : 'es_es'}/v1/maps.json`
    return axios.get(endpoint).then(response => {
        var maps = Object.values(response.data);
        var map = maps.find(map => map.id == id);
        return map.name;
    });
}

module.exports = get_map_name;