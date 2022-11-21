const axios = require('axios');

async function get_map_name(id) {
    var endpoint = `https://static.developer.riotgames.com/docs/lol/maps.json`
    
    return axios.get(endpoint).then(response => {
        var maps = Object.values(response.data);
        var map = maps.find(map => map.mapId == id);
        if (map.mapName === 'Summoner\'s Rift') return 'Grieta del invocador';
        if (map.mapName === 'Howling Abyss') return 'Abismo de los Lamentos';
        if (map.mapName === 'Nexus Blitz') return 'Nexus Blitz';
    });
}

module.exports = get_map_name;