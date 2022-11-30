const Match = require('./match');
const axios = require('axios');

class LastGames {
    constructor() {
        this.matches = this.#gen_arr(10);
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

        var response = await axios.get(endpoint, opts)
            .then(async (response) => {
                var matches = response.data;

                await Promise.all(matches.map(async match => {
                    await this.matches[matches.indexOf(match)].get_match(region, match, puuid);
                }));

                this.wins = this.matches.filter(match => match.stats.win).length;
                this.losses = this.matches.filter(match => !match.stats.win).length;
                this.winrate = (this.wins / this.matches.length) * 100;
                
                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.log(`Timeout: ${endpoint}`);
                    return this.get_last_games(region, puuid);
                }
            });

        return response;
    }

    #gen_arr (length) {
        var arr = [];
        for (var i = 0; i < length; i++) {
            arr.push(new Match());
        }
        return arr;
    }
}

module.exports = LastGames;