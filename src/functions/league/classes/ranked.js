const Profile = require('./profile');
const fetch = require('node-fetch');

class Ranked {
    constructor() {
        this.solo = {
            tier: null,
            rank: null,
            league_points: null,
            wins: null,
            losses: null,
            winrate: null,
            hot_streak: null,
            text: null
        };
        this.flex = {
            tier: null,
            rank: null,
            league_points: null,
            wins: null,
            losses: null,
            winrate: null,
            hot_streak: null,
            text: null
        };
    }

    async get_ranked(id) {
        var endpoint = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`;
        var response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });

        var json = await response.json();
        for (let i = 0; i < json.length; i++) {
            var entry = json[i];
            if (entry.queueType === 'RANKED_SOLO_5x5') {
                this.solo.tier = entry.tier.toLowerCase().charAt(0).toUpperCase() + entry.tier.toLowerCase().slice(1);
                this.solo.rank = entry.rank;
                this.solo.league_points = entry.leaguePoints;
                this.solo.wins = entry.wins;
                this.solo.losses = entry.losses;
                this.solo.winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                this.solo.hot_streak = entry.hotStreak;
                this.solo.text = `${this.solo.tier} ${entry.rank}\n${entry.leaguePoints}LP\n${entry.wins} Victorias /${entry.losses} Derrotas (${this.solo.winrate}% WR)`;
            }
            if (entry.queueType === 'RANKED_FLEX_SR') {
                this.flex.tier = entry.tier.toLowerCase().charAt(0).toUpperCase() + entry.tier.toLowerCase().slice(1);
                this.flex.rank = entry.rank;
                this.flex.league_points = entry.leaguePoints;
                this.flex.wins = entry.wins;
                this.flex.losses = entry.losses;
                this.flex.winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                this.flex.hot_streak = entry.hotStreak;
                this.flex.text = `${this.flex.tier} ${entry.rank}\n${entry.leaguePoints}LP\n${entry.wins} Victorias /${entry.losses} Derrotas (${this.flex.winrate}% WR)`;
            }
        }
        if (!this.solo.text) this.solo.text = 'Unranked';
        if (!this.flex.text) this.flex.text = 'Unranked';
        return this;
    }
}

module.exports = Ranked;