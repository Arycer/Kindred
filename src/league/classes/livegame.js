const Champion = require('./champion');
const axios = require('axios');

const get_queue_name = require('../functions/get_queue_name');
const get_map_name = require('../functions/get_map_name');

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

    get_livegame(region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
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
                this.gamedata.game_start_time = json.gameStartTime;
                this.gamedata.game_map_id = json.mapId;
                get_map_name(this.gamedata.game_map_id).then(name => {
                    this.gamedata.game_map_name = name;
                });
                this.gamedata.game_duration = json.gameLength;
                this.gamedata.game_queue_id = json.gameQueueConfigId;
                get_queue_name(json.gameQueueConfigId).then(name => {
                    this.gamedata.game_queue_name = name;
                });

                this.gamedata.team_side = player.teamId === 100 ? 'blue' : 'red';
                
                this.gamedata.spells = {
                    spell1: player.spell1Id,
                    spell2: player.spell2Id,
                }

                this.gamedata.champion.get_champion(player.championId).then(champ => {
                    this.gamedata.champion = champ;
                });

                this.text = gen_text(this.gamedata);

                return this;
            })
            .catch(error => {
                if (error.response.status === 404) {
                    this.ingame = false;
                    this.text = 'Este jugador no se encuentra en partida ahora mismo.';
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