const fetch = require('node-fetch');
const Item = require('./item');

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
        this.game_duration = null;
        this.timestamp = null;
        this.champ_id = null;
        this.win = null;
    }

    async get_match(match_id, puuid) {
        var endpoint = `https://europe.api.riotgames.com/lol/match/v5/matches/${match_id}`;
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

        var participant = info.participants.find(p => p.puuid === puuid);

        if (this.game_duration < 600) this.win = 'remake';
        else this.win = participant.win;

        this.champ_id = participant.championId;
        this.stats = {
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            kda: (participant.kills + participant.assists) / participant.deaths,
            cs: participant.totalMinionsKilled,
            cs_per_min: participant.totalMinionsKilled / (this.game_duration / 60),
        };
        this.spells = {
            spell1: participant.summoner1Id,
            spell2: participant.summoner2Id,
        };
        for (const item of this.inventory.items) {
            await item.get_item(participant[`item${this.inventory.items.indexOf(item)}`]);
        }
        await this.inventory.trinket.get_item(participant.item6);
        return this;
    }
}

function gen_array_items(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(new Item());
    }
    return arr;
}

module.exports = Match;