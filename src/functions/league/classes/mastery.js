const Champion = require('./champion');
const fetch = require('node-fetch');

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
        this.text = `**[${this.champion_level}]** ${this.champion.name} - ${this.champion_points.toLocaleString('es-ES')} points`;
        return this;
    }
}

module.exports = Mastery;