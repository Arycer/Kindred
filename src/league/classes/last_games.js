const Match = require('./match');
const axios = require('axios');

class LastGames {
    constructor() {
        this.matches = gen_array_matches(10);
        this.wins = 0;
        this.losses = 0;
        this.winrate = null;
    }

    async get_last_games(region, puuid) {
        var endpoint = `https://${region.route}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${this.matches.length}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios.get(endpoint, opts)
            .then(async response => {
                var matches = response.data;

                for (let i = 0; i < matches.length; i++) {
                    await this.matches[i].get_match(region, matches[i], puuid);
                }
                
                do {
                    this.wins = this.matches.filter(m => m.stats.win).length;
                this.losses = this.matches.filter(m => !m.stats.win).length;
                this.winrate = (this.wins / (this.wins + this.losses)) * 100;
                } while (!this.winrate);

                return this;
            })
            .catch(err => {
                if (err.code === 'ECONNABORTED') {
                    console.log(`Timeout: ${endpoint}`);
                    return this.get_last_games(region, puuid);
                }
            });
    }
}

module.exports = LastGames;

function gen_array_matches(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(new Match());
    }
    return arr;
}