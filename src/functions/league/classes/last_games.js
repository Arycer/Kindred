const fetch = require('node-fetch');
const Match = require('./match');

class LastGames {
    constructor() {
        this.matches = gen_array_matches(10);
        this.wins = 0;
        this.losses = 0;
        this.winrate = null;
    }

    async get_last_games(puuid) {
        var endpoint = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${this.matches.length}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var json = await response.json();

        for (const match_id of json) {
            await this.matches[json.indexOf(match_id)].get_match(match_id, puuid);
        }

        this.wins = this.matches.filter(m => m.win === true).length;
        this.losses = this.matches.filter(m => m.win === false).length;
        this.winrate = Math.round((this.wins / (this.wins + this.losses)) * 100);
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