const Match = require('./match');
const axios = require('axios');

class LastGames {
    async constructor (region, puuid) {
        this.matches = #arr_matches(10);
        this.wins = 0;
        this.losses = 0;
        this.winrate = null;
        
        await get(region, puuid);
    }
    
    #arr_matches (n) {
        var arr = [];
        for (var i = 0; i < n; i++) arr.push(new Match());
        return arr;
    }

    async get(region, puuid) {
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
                this.wins = this.matches.filter(m => m.stats.win).length;
                this.losses = this.matches.filter(m => !m.stats.win).length;
                this.winrate = (this.wins / (this.wins + this.losses)) * 100;

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
