const Champion = require('./champion');
const fetch = require('node-fetch');

class LiveGame {
    constructor() {
        this.ingame = false;
        this.gamedata = {
            game_id: null,
            game_start_time: null,
            game_map_id: null,
            game_map_name: null,
            game_duration: null,
            game_queue_id: null,
            game_queue_name: null,
            team_side: null,
            spells: {
                spell1: null,
                spell2: null,
            },
            champion: new Champion()
        }
    }

    async get_livegame(summoner_id) {
        var endpoint = `https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner_id}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();
        if (!json.gameId) return this;
        this.ingame = true;
        this.gamedata.game_id = json.gameId;
        this.gamedata.game_start_time = json.gameStartTime;
        this.gamedata.game_map_id = json.mapId;
        this.gamedata.game_map_name = await get_map_name(json.mapId);
        this.gamedata.game_duration = json.gameLength;
        this.gamedata.game_queue_id = json.gameQueueConfigId;
        this.gamedata.game_queue_name = await get_queue_name(json.gameQueueConfigId);
        var participant = json.participants.find(participant => participant.summonerId == summoner_id);
        this.gamedata.team_side = participant.teamId == 100 ? 'blue' : 'red';
        this.gamedata.spells.spell1 = participant.spell1Id;
        this.gamedata.spells.spell2 = participant.spell2Id;
        this.gamedata.champion = await this.gamedata.champion.get_champion(participant.championId);
        return this;
    }
}

async function get_queue_name(id) {
    var endpoint = `https://static.developer.riotgames.com/docs/lol/queues.json`
    var response = await fetch(endpoint);
    var json = await response.json();
    var queues = Object.values(json);
    var queue = queues.find(queue => queue.queueId == id);
    return queue.description;

}

async function get_map_name(id) {
    var endpoint = `https://static.developer.riotgames.com/docs/lol/maps.json`
    var response = await fetch(endpoint);
    var json = await response.json();
    var maps = Object.values(json);
    var map = maps.find(map => map.mapId == id);
    return map.mapName;
}

module.exports = LiveGame;