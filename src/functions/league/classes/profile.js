const fetch = require('node-fetch');

const Summoner = require('./summoner_data');
const LiveGame = require('./livegame');
const Mastery = require('./mastery');
const Ranked = require('./ranked');
const Match = require('./match');

class Profile {
    constructor() {
        this.summoner_data = new Summoner();
        this.ranked = new Ranked();
        this.mastery = {
            champions: gen_array_masteries(3),
            score: null
        };
        this.history = {
            last_10: {
                matches: gen_array_matches(10),
                wins: 0, losses: 0,
                winrate: null,
            }
        }
        this.livegame = new LiveGame();
    }

    async get_masteries() {
        var all_endpoint = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${this.summoner_data.summoner_id}`;
        var all_response = await fetch(all_endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var all_json = await all_response.json();
        var ids = [];
        for (let i = 0; i < 3; i++) {
            if (all_json[i]) ids.push(all_json[i].championId);
            else break;
        }

        for (const id of ids) {
            await this.mastery.champions[ids.indexOf(id)].get_mastery(this.summoner_data.summoner_id, id);
        }

        var score_endpoint = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${this.summoner_data.summoner_id}`;
        var score_response = await fetch(score_endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var score_json = await score_response.json();
        this.mastery.score = score_json;
    }

    async init(username, interaction) {
        await this.summoner_data.get_summoner(username);
        if (!this.summoner_data.summoner_id) return this;
        var msg = await interaction.channel.send('Obteniendo datos (1/6)');

        await this.ranked.get_ranked(this.summoner_data.summoner_id);
        await msg.edit('Obteniendo datos (2/6)');

        await this.get_masteries();
        await msg.edit('Obteniendo datos (3/6)');
        
        var last_10_endpoint = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${this.summoner_data.puuid}/ids?start=0&count=10`;
        var last_10_response = await fetch(last_10_endpoint, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        });
        var last_10_ids = await last_10_response.json();
        await msg.edit('Obteniendo datos (4/6)');

        for (const id of last_10_ids) {
            await this.history.last_10.matches[last_10_ids.indexOf(id)].get_match(id, this.summoner_data.puuid);
            if (this.history.last_10.matches[last_10_ids.indexOf(id)].win) this.history.last_10.wins++;
            else if (!this.history.last_10.matches[last_10_ids.indexOf(id)].win) this.history.last_10.losses++;
            this.history.last_10.winrate = (this.history.last_10.wins / (this.history.last_10.wins + this.history.last_10.losses)) * 100;
            await msg.edit(`Obteniendo datos (5.${last_10_ids.indexOf(id)+1}/6)`);
        }

        await this.livegame.get_livegame(this.summoner_data.summoner_id);
        await msg.delete();
        return this;
    }
}

function gen_array_matches(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(new Match());
    }
    return arr;
}

function gen_array_masteries(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(new Mastery());
    }
    return arr;
}

async function wait(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

module.exports = Profile;