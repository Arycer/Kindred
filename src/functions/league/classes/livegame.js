const Champion = require('./champion');
const fetch = require('node-fetch');

const get_queue_name = require('../fetch/get_queue_name');
const get_map_name = require('../fetch/get_map_name');

class LiveGame {
    constructor() {
        this.ingame = false;
        this.text = null;
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
        if (!json.gameId) {
            this.ingame = false;
            this.text = 'Este jugador no se encuentra en partida ahora mismo.';
            return this;
        }
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
        this.text = gen_text(this, participant);
        return this;
    }
}

function gen_text (obj, participant) {
    var gamedata = obj.gamedata;
    if (!obj.ingame) return obj.text;
    else {
        var url = `https://porofessor.gg/es/live/euw/${participant.summonerName.split(' ').join('%20')}`;
        var l1 = `🟢 **Jugando:** ${gamedata.champion.name} en ${gamedata.game_map_name} (${gamedata.game_queue_name})`;
        var l2 = `🕐 **Tiempo transcurrido:** ${Math.floor(gamedata.game_duration / 60)}:${gamedata.game_duration % 60 < 10 ? '0' + gamedata.game_duration % 60 : gamedata.game_duration % 60}`;
        var l3 = `📅 **Fecha:** ${new Date(gamedata.game_start_time).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`;
        l3 += ` - 🔗 **Enlace:** [Porofessor](${url})`
        return `${l1}\n${l2}\n${l3}`;
    }
}

module.exports = LiveGame;