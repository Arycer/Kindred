const get_queue_name = require('../functions/get_queue_name');
const get_map_name = require('../functions/get_map_name');
const get_emote = require('../functions/get_emote');

const Champion = require('./champion');
const Item = require('./item');

const axios = require('axios');

class Match {
    constructor () {
        this.inventory = {
            items: gen_array_items(6),
            trinket: new Item(),
        }
        this.stats = {
            kills: null,
            deaths: null,
            assists: null,
            kda: null,
            cs: null,
            cs_per_min: null,
        }
        this.spells = {
            spell1: null,
            spell2: null,
        }
        this.game_queue_id = null;
        this.game_queue_name = null;
        this.game_map_id = null;
        this.game_map_name = null;
        this.game_duration = null;
        this.timestamp = null;
        this.champ = new Champion();
        this.win = null;
        this.text = null;
        this.url = null;
    }

    get_match(region, match_id, puuid) {
        var endpoint = `https://${region.route}.api.riotgames.com/lol/match/v5/matches/${match_id}`;
        var opts = {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var match = response.data.info;
                var player = match.participants.find(p => p.puuid === puuid);

                this.game_queue_id = match.queueId;
                this.game_queue_name = await get_queue_name(this.game_queue_id);

                this.game_map_id = match.mapId;
                this.game_map_name = await get_map_name(this.game_map_id);

                this.game_duration = match.gameDuration;
                this.timestamp = match.gameCreation;

                await this.champ.get_champion(player.championName);
                this.stats = {
                    kills: player.kills,
                    deaths: player.deaths,
                    assists: player.assists,
                    kda: (player.kills + player.assists) / player.deaths,
                    cs: player.totalMinionsKilled + player.neutralMinionsKilled,
                    cs_per_min: (player.totalMinionsKilled + player.neutralMinionsKilled) / (this.game_duration / 60),
                };
                this.spells = {
                    spell1: player.summoner1Id,
                    spell2: player.summoner2Id,
                };

                for (let i = 0; i < this.inventory.items.length; i++) {
                    this.inventory.items[i].get_item(player['item' + i]);
                }

                this.inventory.trinket.get_item(player.perks.perkStyle);

                if (this.game_duration < 300) this.win = 'remake';
                else this.win = player.win;

                this.url = `https://www.leagueofgraphs.com/es/match/${region.name.toLowerCase()}/${match_id.split('_')[1]}`;
                this.text = gen_text(this);
                return this;
            }).catch(error => {
                console.log(error);
                console.log(endpoint);
                if (error.response.status == 404) {
                    return 'No se ha encontrado ninguna partida con ese ID.';
                } else {
                    return 'Ha ocurrido un error al obtener la partida.';
                }
            });
    }
}

function gen_text (obj) {
    if (typeof obj.win === 'boolean') {
        if (obj.win) var wintext = `🟢 **Victoria**`;
        else var wintext = `🔴 **Derrota**`;
    } else var wintext = `⚙️ **Remake**`;
    var e_cs = get_emote('minioncount'); var c = obj.champ; var s = obj.stats;
    var l1 = `${wintext} con ${c.emote} ${c.name} - ${s.kills}/${s.deaths}/${s.assists} - ${s.cs} ${e_cs} (${s.cs_per_min.toFixed(1)} ${e_cs}/min)`;
    var l2 = `🕐 **Duración de la partida:** ${Math.floor(obj.game_duration / 60)}:${obj.game_duration % 60 < 10 ? '0' + obj.game_duration % 60 : obj.game_duration % 60}`;
    var l3 = `📅 **Fecha:** ${new Date(obj.timestamp).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} - 🔗 **Enlace:** [League of Graphs](${obj.url})`;
    return `${l1}\n${l2}\n${l3}`;
}

function gen_array_items(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(new Item());
    }
    return arr;
}

module.exports = Match;