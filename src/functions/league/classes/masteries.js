const fetch = require('node-fetch');

const Champion = require('./champion');

class Mastery {
    constructor () {
        this.champion = new Champion();
        this.champion_level = null;
        this.champion_points = null;
        this.champion_points_until_next_level = null;
        this.champion_points_since_last_level = null;
        this.last_play_time = null;
        this.chest_granted = null;
        this.tokens_earned = null;
        this.summoner_id = null;
        this.text = null;
    }

    async get_mastery(summoner_id, champ_id) {
        var endpoint = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}/by-champion/${champ_id}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();
        this.champion = await this.champion.get_champion(json.championId);
        this.champion_level = json.championLevel;
        this.champion_points = json.championPoints;
        this.champion_points_until_next_level = json.championPointsUntilNextLevel;
        this.champion_points_since_last_level = json.championPointsSinceLastLevel;
        this.last_play_time = json.lastPlayTime;
        this.champion_points_until_next_level = json.championPointsUntilNextLevel;
        this.chest_granted = json.chestGranted;
        this.tokens_earned = json.tokensEarned;
        this.summoner_id = json.summonerId;
        this.text = `${this.champion.emote} **[${this.champion_level}]** ${this.champion.name} - ${this.champion_points.toLocaleString('es-ES')} puntos`;
        return this;
    }
}

class Masteries {
    constructor() {
        this.champions = gen_array_masteries(3);
        this.score = null;
    }

    async get_masteries(summoner_id) {
        var endpoint = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();
        var champ_ids = [];

        for (let i = 0; i < this.champions.length; i++) {
            if (json[i]) {
                champ_ids.push(json[i].championId);
            } else {
                break;
            }
        }

        for (const champ_id of champ_ids) {
            await this.champions[champ_ids.indexOf(champ_id)].get_mastery(summoner_id, champ_id);
        }

        var s_endpoint = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${summoner_id}`;
        var s_response = await fetch(s_endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        this.score = await s_response.json();
    }
    
}

module.exports = Masteries;

function gen_array_masteries(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(new Mastery());
    }
    return arr;
}