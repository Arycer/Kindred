const get_emote = require('../functions/get_emote');
const axios = require('axios');

class Ranked {
    constructor() {
        this.solo = {
            tier: null,
            rank: null,
            lps: null,
            wins: null,
            losses: null,
            winrate: null,
            emote: null
        };
        this.flex = {
            tier: null,
            rank: null,
            lps: null,
            wins: null,
            losses: null,
            winrate: null,
            emote: null
        };
    }

    get_ranked(region, id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        return axios(endpoint, opts)
            .then(res => {
                var data = res.data;

                for (const entry of data) {
                    if (entry.queueType === 'RANKED_SOLO_5x5') {
                        this.solo.tier = entry.tier;
                        this.solo.emote = get_emote(entry.tier.toLowerCase());
                        this.solo.rank = entry.rank;
                        this.solo.lps = entry.leaguePoints;
                        this.solo.wins = entry.wins;
                        this.solo.losses = entry.losses;
                        this.solo.winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                    } else if (entry.queueType === 'RANKED_FLEX_SR') {
                        this.flex.tier = entry.tier;
                        this.flex.emote = get_emote(entry.tier.toLowerCase());
                        this.flex.rank = entry.rank;
                        this.flex.lps = entry.leaguePoints;
                        this.flex.wins = entry.wins;
                        this.flex.losses = entry.losses;
                        this.flex.winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
                    }
                }
                return this;
            }).catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_ranked(region, id);
                }
            });
    }
}

module.exports = Ranked;