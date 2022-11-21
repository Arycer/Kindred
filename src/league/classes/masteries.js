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
        this.text = null;
    }

    get_mastery(region, summoner_id, champ_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}/by-champion/${champ_id}`;
        var opts = {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var mastery = response.data;

                await this.champion.get_champion(mastery.championId).then(champ => {
                    this.champion = champ;
                });

                this.champion_level = mastery.championLevel;
                this.champion_points = mastery.championPoints;
                this.champion_points_until_next_level = mastery.championPointsUntilNextLevel;
                this.champion_points_since_last_level = mastery.championPointsSinceLastLevel;
                this.last_play_time = mastery.lastPlayTime;
                this.chest_granted = mastery.chestGranted;
                this.tokens_earned = mastery.tokensEarned;
                this.summoner_id = mastery.summonerId;
                this.text = `${this.champion.emote} **[${this.champion_level}]** ${this.champion.name} - ${this.champion_points.toLocaleString('es-ES')} puntos`;

                return this;
            })
            .catch(error => {
                console.log(error);
            });
    }
}

class Masteries {
    constructor() {
        this.champions = gen_array_masteries(3);
        this.score = null;
    }

    get_score (region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
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
                console.log(error);
            });
    }

    get_masteries(region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var masteries = response.data;
                var ids = [];

                for (var i = 0; i < this.champions.length; i++) {
                    if (masteries[i]) {
                        ids.push(masteries[i].championId);
                        await this.champions[i].get_mastery(region, summoner_id, masteries[i].championId).then(mastery => {
                            this.champions[i] = mastery;
                        });
                    }
                }

                await this.get_score(region, summoner_id).then(score => {
                    this.score = score;
                });

                return this;
            })
            .catch(error => {
                console.log(error);
            });
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