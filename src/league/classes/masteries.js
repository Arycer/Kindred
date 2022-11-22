const Champion = require('./champion');
const axios = require('axios');

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
    }

    get_mastery(region, summoner_id, champ_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}/by-champion/${champ_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var mastery = response.data;

                this.champion = await this.champion.get_champion(region, champ_id);
                this.champion_level = mastery.championLevel;
                this.champion_points = mastery.championPoints;
                this.champion_points_until_next_level = mastery.championPointsUntilNextLevel;
                this.champion_points_since_last_level = mastery.championPointsSinceLastLevel;
                this.last_play_time = mastery.lastPlayTime;
                this.chest_granted = mastery.chestGranted;
                this.tokens_earned = mastery.tokensEarned;
                this.summoner_id = mastery.summonerId;

                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.log(`Timeout: ${endpoint}`);
                    return this.get_mastery(region, summoner_id, champ_id);
                }
            });
    }

    async set_mastery(data) {
        this.champion_level = data.championLevel;
        this.champion_points = data.championPoints;
        this.champion_points_until_next_level = data.championPointsUntilNextLevel;
        this.champion_points_since_last_level = data.championPointsSinceLastLevel;
        this.last_play_time = data.lastPlayTime;
        this.chest_granted = data.chestGranted;
        this.tokens_earned = data.tokensEarned;
        this.summoner_id = data.summonerId;
        this.champion = await this.champion.get_champion(data.championId);

        return this;
    }
}

class Masteries {
    constructor() {
        this.champions = [
            new Mastery(),
            new Mastery(),
            new Mastery()
        ]
        this.score = null;
    }

    get_score (region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY    
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                this.score = response.data;
                return this.score;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.log(`Timeout: ${endpoint}`);
                    return this.get_score(region, summoner_id);
                }
            });
    }

    get_masteries(region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                this.score = await this.get_score(region, summoner_id);
                
                var masteries = response.data;

                for (var i = 0; i < 3; i++) {
                    this.champions[i] = await this.champions[i].set_mastery(masteries[i]);
                }

                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_masteries(region, summoner_id);
                }
            });
    }
}

module.exports = Masteries;