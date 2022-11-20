const get_emote = require('../fetch/get_emote');
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
            text: null,
            emote: null
        };
        this.flex = {
            tier: null,
            rank: null,
            league_points: null,
            wins: null,
            losses: null,
            winrate: null,
            hot_streak: null,
            text: null,
            emote: null
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
                this.solo.tier = translate_tier(entry.tier);
                this.solo.rank = entry.rank;
                this.solo.league_points = entry.leaguePoints;
                this.solo.wins = entry.wins;
                this.solo.losses = entry.losses;
                this.solo.winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                this.solo.hot_streak = entry.hotStreak;
                this.solo.emote = get_emote(entry.tier);
                if (this.solo.tier === 'Maestro' || this.solo.tier === 'Gran Maestro' || this.solo.tier === 'Challenger') {
                    var l1 = `${this.solo.emote} ${this.solo.tier}`;
                    var l2 = `${this.solo.league_points} Puntos de Liga`;
                    var l3 = `${this.solo.wins} Victorias - ${this.solo.losses} Derrotas (${this.solo.winrate}% WR)`;
                    this.solo.text = `${l1}\n${l2}\n${l3}`;
                } else {
                    var l1 = `${this.solo.emote} ${this.solo.tier} ${this.solo.rank}`;
                    var l2 = `${this.solo.league_points} Puntos de Liga`;
                    var l3 = `${this.solo.wins} Victorias - ${this.solo.losses} Derrotas (${this.solo.winrate}% WR)`;
                    this.solo.text = `${l1}\n${l2}\n${l3}`;
                }
            }
            if (entry.queueType === 'RANKED_FLEX_SR') {
                this.flex.tier = translate_tier(entry.tier);
                this.flex.rank = entry.rank;
                this.flex.league_points = entry.leaguePoints;
                this.flex.wins = entry.wins;
                this.flex.losses = entry.losses;
                this.flex.winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                this.flex.hot_streak = entry.hotStreak;
                this.flex.emote = get_emote(entry.tier);
                var l1 
                this.flex.text = `${this.flex.emote} ${this.flex.tier} ${entry.rank}\n${entry.leaguePoints} Puntos de Liga\n${entry.wins} Victorias /${entry.losses} Derrotas (${this.flex.winrate}% WR)`;
            }
        }
        if (!this.solo.text) {
            this.solo.text = 'Unranked';
            this.solo.emote = '<:unranked:1043560446357143592>';
        }
        if (!this.flex.text) {
            this.flex.text = 'Unranked';
            this.flex.emote = '<:unranked:1043560446357143592>';
        }
        return this;
    }
}

function translate_tier (tier) {
    switch (tier.toLowerCase()) {
        case 'iron':
            return 'Hierro';
        case 'bronze':
            return 'Bronce';
        case 'silver':
            return 'Plata';
        case 'gold':
            return 'Oro';
        case 'platinum':
            return 'Platino';
        case 'diamond':
            return 'Diamante';
        case 'master':
            return 'Maestro';
        case 'grandmaster':
            return 'Gran Maestro';
        case 'challenger':
            return 'Challenger';
    }
}

module.exports = Ranked;