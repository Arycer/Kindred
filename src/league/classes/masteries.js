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

    async get_mastery(region, summoner_id, champ_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}/by-champion/${champ_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        var response = await axios.get(endpoint, opts)
            .then(async (response) => {
                var mastery = response.data;
                return await this.set_mastery(mastery);
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_mastery(region, summoner_id, champ_id);
                }
            });

        return response;
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

class Masteries extends Mastery {
    constructor() {
        super();
        this.champions = this.#gen_arr(3);
        this.score = null;
    }

    async get_masteries(region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}/top`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        var response = await axios.get(endpoint, opts)
            .then(async (response) => {
                var masteries = response.data;

                for (var i = 0; i < masteries.length; i++) {
                    await this.champions[i].set_mastery(masteries[i]);
                }

                this.score = await this.#get_score(region, summoner_id);

                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                }
            });

        return response;
    }

    async #get_score (region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY    
            }
        };

        var response = await axios.get(endpoint, opts)
            .then(response => {
                this.score = response.data;
                return this.score;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_score(region, summoner_id);
                }
            });

        return response;
    }

    #gen_arr (length) {
        var arr = [];
        for (var i = 0; i < length; i++) {
            arr.push(new Mastery());
        }
        return arr;
    }
}

module.exports = Masteries;