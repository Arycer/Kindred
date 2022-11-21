const get_queue_name = require('../functions/get_queue_name');
const get_map_name = require('../functions/get_map_name');
const get_emote = require('../functions/get_emote');

const Champion = require('./champion');
const Item = require('./item');

const fetch = require('node-fetch');

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

    async get_match(region, match_id, puuid) {
        var endpoint = `https://${region.route}.api.riotgames.com/lol/match/v5/matches/${match_id}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();
        var info = json.info;
    
        this.game_duration = info.gameDuration;
        this.timestamp = info.gameCreation;

        this.game_queue_id = info.queueId;
        this.game_queue_name = await get_queue_name(info.queueId);

        this.game_map_id = info.mapId;
        this.game_map_name = await get_map_name(info.mapId);

        var participant = info.participants.find(p => p.puuid === puuid);

        if (this.game_duration < 600) this.win = 'remake';
        else this.win = participant.win;

        this.champ = await this.champ.get_champion(participant.championId);
        this.stats = {
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            kda: (participant.kills + participant.assists) / participant.deaths,
            cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
            cs_per_min: (participant.totalMinionsKilled + participant.neutralMinionsKilled) / (this.game_duration / 60),
        };
        this.spells = {
            spell1: participant.summoner1Id,
            spell2: participant.summoner2Id,
        };
        for (const item of this.inventory.items) {
            await item.get_item(participant[`item${this.inventory.items.indexOf(item)}`]);
        }
        await this.inventory.trinket.get_item(participant.item6);
        this.url = `https://www.leagueofgraphs.com/es/match/${region.name.toLowerCase()}/${match_id.split('_')[1]}`;
        this.text = gen_text(this);
        return this;
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