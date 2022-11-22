const get_queue_name = require('../functions/get_queue_name');
const get_map_name = require('../functions/get_map_name');
const get_emote = require('../functions/get_emote');

const Champion = require('./champion');
const Item = require('./item');

const axios = require('axios');

class Match {
    constructor () {
        this.stats = {
            kills: null,
            deaths: null,
            assists: null,
            kda: null,
            win: null,
            cs: null,
            cs_per_min: null,
        }
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
        this.inventory = {
            items: [
                new Item(),
                new Item(),
                new Item(),
                new Item(),
                new Item(),
                new Item(),
            ],
            trinket: new Item(),
        }
        this.game_id = null;
        this.champion = new Champion();
    }

    get_match(region, match_id, puuid) {
        var endpoint = `https://${region.route}.api.riotgames.com/lol/match/v5/matches/${match_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var match = response.data.info;
                var player = match.participants.find(p => p.puuid === puuid);

                this.stats = {
                    kills: player.kills,
                    deaths: player.deaths,
                    assists: player.assists,
                    kda: (player.kills + player.assists) / player.deaths,
                    cs: player.totalMinionsKilled + player.neutralMinionsKilled,
                    cs_per_min: (player.totalMinionsKilled + player.neutralMinionsKilled) / (match.gameDuration / 60),
                    win: match.gameDuration < 300 ? 'remake' : player.win,
                }

                this.spells = {
                    spell1: player.summoner1Id,
                    spell2: player.summoner2Id,
                }

                this.queue = {
                    name: await get_queue_name(match.queueId),
                    id: match.queueId,
                }

                this.map = {
                    name: await get_map_name(match.mapId),
                    id: match.mapId,
                }

                this.time = {
                    duration: match.gameDuration,
                    start: match.gameCreation,
                }

                for (var i = 0; i < this.inventory.items.length; i++) {
                    this.inventory.items[i].get_item(player['item' + i]);
                }
                this.inventory.trinket.get_item(player.item6);

                this.game_id = match_id;
                this.champion = await this.champion.get_champion(player.championId);

                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.log(`Timeout: ${endpoint}`);
                    return this.get_match(region, match_id, puuid);
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

module.exports = Match;
