const get_queue_name = require('../functions/get_queue_name');
const get_map_name = require('../functions/get_map_name');

const Champion = require('./champion');
const Spell = require('./spell');
const Item = require('./item');

const axios = require('axios');

const MeowDB = require('meowdb');

const matches = new MeowDB({
    dir: 'src/database',
    name: 'matches',
})


class Match {
    constructor () {
        this.stats = {
            kills: null,
            deaths: null,
            assists: null,
            kda: null,
            win: null,
            cs: null,
            cs_per_min: null,
        }
        this.spells = {
            spell1: new Spell(),
            spell2: new Spell(),
        }
        this.queue = {
            name: null,
            id: null,
        }
        this.map = {
            name: null,
            id: null,
        }
        this.time = {
            duration: null,
            start: null,
        }
        this.inventory = {
            items: this.#gen_arr(6),
            trinket: new Item(),
        }
        this.game_id = null;
        this.champion = new Champion();
    }

    async get_match(region, match_id, puuid) {
        var match = matches.get(`${match_id}/${puuid}`);
        if (match) return Object.assign(this, match);

        var endpoint = `https://${region.route}.api.riotgames.com/lol/match/v5/matches/${match_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        var response = await axios.get(endpoint, opts)
            .then(async (response) => {
                var data = response.data;
                var match = data.info;
                var player = match.participants.find(p => p.puuid === puuid);
        
                this.stats = {
                    kills: player.kills,
                    deaths: player.deaths,
                    assists: player.assists,
                    kda: ((player.kills + player.assists) / player.deaths).toFixed(2),
                    cs: player.totalMinionsKilled + player.neutralMinionsKilled,
                    cs_per_min: ((player.totalMinionsKilled + player.neutralMinionsKilled) / (match.gameDuration / 60)).toFixed(1),
                    win: match.gameDuration < 300 ? 'remake' : player.win,
                }
        
                this.spells = {
                    spell1: await this.spells.spell1.get_spell(player.summoner1Id),
                    spell2: await this.spells.spell2.get_spell(player.summoner2Id)
                }
        
                this.queue = {
                    name: await get_queue_name(match.queueId),
                    id: match.queueId,
                }
        
                this.map = {
                    name: await get_map_name(match.mapId),
                    id: match.mapId,
                }
        
                this.time = {
                    duration: match.gameDuration,
                    start: match.gameCreation,
                }
                for (var i = 0; i < this.inventory.items.length; i++) {
                    await this.inventory.items[i].get_item(player['item' + i]);
                }
                await this.inventory.trinket.get_item(player.item6);
        
                this.game_id = match_id;
                this.champion = await this.champion.get_champion(player.championId);
        
                matches.set(`${match_id}/${puuid}`, this);
                console.log('Partida %s (%s) guardada en la base de datos', match_id, player.summonerName);
                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.log(`Timeout: ${endpoint}`);
                }
            });

        return response;
    }

    #gen_arr (length) {
        var arr = [];
        for (var i = 0; i < length; i++) {
            arr.push(new Item());
        }
        return arr;
    }
}

module.exports = Match;
