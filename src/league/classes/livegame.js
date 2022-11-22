const Champion = require('./champion');
const axios = require('axios');

const get_queue_name = require('../functions/get_queue_name');
const get_map_name = require('../functions/get_map_name');

class LiveGame {
    constructor() {
        this.ingame = false;
        this.spells = {
            spell1: null,
            spell2: null,
        }
        this.queue = {
            name: null,
            id: null,
        }
        this.map = {
            name: null,
            id: null,
        }
        this.time = {
            duration: null,
            start: null,
        }
        this.teamside = null;
        this.champion = new Champion();
    }

    get_livegame(region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var game = response.data;
                var player = game.participants.find(p => p.summonerId === summoner_id);

                this.ingame = true;
                this.gamedata.game_id = json.gameId;
                this.time = {
                    duration: game.gameLength,
                    start: game.gameStartTime,
                }
                this.queue = {
                    name: await get_queue_name(game.gameQueueConfigId),
                    id: game.gameQueueConfigId,
                }
                this.map = {
                    name: await get_map_name(game.mapId),
                    id: game.mapId,
                }
                this.spells = {
                    spell1: player.spell1Id,
                    spell2: player.spell2Id,
                }
                this.team_side = player.teamId === 100 ? 'blue' : 'red';
                this.gamedata.champion = await this.gamedata.champion.get_champion(player.championId);

                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_livegame(region, summoner_id);
                }

                if (error.response.status === 404) {
                    return this;
                } else {
                    console.log(error);
                }
            });
    }
}

function gen_text (obj, participant, region) {
    var gamedata = obj.gamedata;
    if (!obj.ingame) return obj.text;
    else {
        var url = `https://porofessor.gg/es/live/${region.name.toLowerCase()}/${participant.summonerName.split(' ').join('%20')}`;
        var l1 = `🟢 **Jugando:** ${gamedata.champion.emote} ${gamedata.champion.name} - ${gamedata.game_map_name} - ${gamedata.game_queue_name}`;
        var l2 = `🕐 **Tiempo transcurrido:** ${Math.floor(gamedata.game_duration / 60)}:${gamedata.game_duration % 60 < 10 ? '0' + gamedata.game_duration % 60 : gamedata.game_duration % 60}`;
        var start_timestamp = gamedata.game_start_time;
        if (!start_timestamp) start_timestamp = Date.now();
        var l3 = `📅 **Fecha:** ${new Date(start_timestamp).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} - 🔗 **Enlace:** [Porofessor](${url})`
        return `${l1}\n${l2}\n${l3}`;
    }
}


module.exports = LiveGame;