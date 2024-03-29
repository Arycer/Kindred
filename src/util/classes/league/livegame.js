const Summoner = require('./summoner');
const Champion = require('./champion');
const Ranked = require('./ranked');
const Spell = require('./spell');
const Rune = require('./rune');
const axios = require('axios');

class Participant {
    constructor() {
        this.champion = new Champion();
        this.spells = {
            spell1: new Spell(),
            spell2: new Spell()
        };
        this.runes = {
            primary: new Rune(),
            secondary: new Rune()
        };
        this.summoner_data = new Summoner();
        this.ranked = new Ranked();
    }
}
class LiveGame {
    constructor() {
        this.ingame = false;
        this.spells = {
            spell1: null,
            spell2: null,
        }
        this.time = {
            duration: null,
            start: null,
        }
        this.participants = {
            blue: this.#gen_arr(5),
            red: this.#gen_arr(5),
        }
        this.map = null
        this.queue = null
        this.teamside = null;
        this.champion = new Champion();
    }

    async get_livegame(region, summoner_id) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner_id}`;
        var opts = {
            method: 'GET',
            timeout: 2000,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            }
        };

        var response = await axios.get(endpoint, opts)
            .then(async (response) => {
                var game = response.data;
                var player = game.participants.find(p => p.summonerId === summoner_id);

                this.ingame = true;
                this.time = {
                    duration: game.gameLength,
                    start: game.gameStartTime,
                }
                this.spells = {
                    spell1: player.spell1Id,
                    spell2: player.spell2Id,
                }
                this.map = game.mapId;
                this.queue = game.gameQueueConfigId;
                this.team_side = player.teamId === 100 ? 'blue' : 'red';
                this.champion = await this.champion.get_champion(player.championId);

                await Promise.all([
                    await Promise.all(this.participants.blue.map(async (participant, i) => {
                        var p = game.participants[i];
    
                        participant.champion = await participant.champion.get_champion(p.championId);
                        participant.spells = {
                            spell1: await participant.spells.spell1.get_spell(p.spell1Id),
                            spell2: await participant.spells.spell2.get_spell(p.spell2Id),
                        }
                        participant.runes = {
                            primary: await participant.runes.primary.get_rune(p.perks.perkIds[0]),
                            secondary: await participant.runes.secondary.get_rune(p.perks.perkSubStyle),
                        }
                        participant.summoner_data = await participant.summoner_data.get_summoner(region, p.summonerName);
                        participant.ranked = await participant.ranked.get_ranked(region, participant.summoner_data.identifiers.s_id);
                    })),
    
                    await Promise.all(this.participants.red.map(async (participant, i) => {
                        var p = game.participants[i + 5];
    
                        participant.champion = await participant.champion.get_champion(p.championId);
                        participant.spells = {
                            spell1: await participant.spells.spell1.get_spell(p.spell1Id),
                            spell2: await participant.spells.spell2.get_spell(p.spell2Id),
                        }
                        participant.runes = {
                            primary: await participant.runes.primary.get_rune(p.perks.perkIds[0]),
                            secondary: await participant.runes.secondary.get_rune(p.perks.perkSubStyle),
                        }
                        participant.summoner_data = await participant.summoner_data.get_summoner(region, p.summonerName);
                        participant.ranked = await participant.ranked.get_ranked(region, participant.summoner_data.identifiers.s_id);
                    }))
                ])

                return this;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return this.get_livegame(region, summoner_id);
                } else if (error?.response?.status === 404) {
                    return this;
                }
            });

        return response;
    }

    #gen_arr (length) {
        var arr = [];
        for (var i = 0; i < length; i++) {
            arr.push(new Participant());
        }
        return arr;
    }
}

module.exports = LiveGame;