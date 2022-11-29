const Match = require('./match');
const axios = require('axios');

class LastGames {
    #matches;
    #wins;
    #losses;
    #winrate;

    constructor (region, puuid) {
        this.#matches = this.#arr_matches(10);
        this.#wins = 0;
        this.#losses = 0;
        this.#winrate = null;
        console.log(region, puuid)
        return this.#init(region, puuid);
    }

    async #init(region, puuid) {
        console.log(region, puuid)
        var endpoint = `https://${region.route}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${this.matches.length}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token' : process.env.RIOT_API_KEY
            }
        };

        var request = await axios.get(endpoint, opts).catch(err => {
            if (err.code === 'ECONNABORTED') {
                console.log('Timeout: %s', endpoint);
                return this.get(region, puuid);
            } else console.error(err);
        });

        var matches = request.data;

        for (var i = 0; i < matches.length; i++) this.#matches.get_match(region, matches[i], puuid);

        this.#wins = this.#matches.filter(m => m.stats.win).length;
        this.#losses = this.#matches.filter(m => !m.stats.win).length;
        this.#winrate = (this.#wins / (this.#wins + this.#losses)) * 100;

        return this;
    }
    
    #arr_matches (n) {
        var arr = [];
        for (var i = 0; i < n; i++) arr.push(new Match());
        return arr;
    }
}

module.exports = LastGames;
