const Summoner = require('./summoner_data');
const LastGames = require('./last_games');
const Masteries = require('./masteries');
const LiveGame = require('./livegame');
const Ranked = require('./ranked');
const Region = require('./region');

class Profile {
    constructor() {
        this.summoner_data = new Summoner();
        this.region = new Region();
        this.masteries = new Masteries();
        this.lastgames = new LastGames();
        this.livegame = new LiveGame();
        this.ranked = new Ranked();
    }

    async init(region, identifier) {
        this.region.get_region(region);
        this.summoner_data = await this.summoner_data.get_summoner(this.region, identifier);

        if (!this.summoner_data.identifiers.s_id) {
            return this;
        } else {
            return Promise.all([
            this.ranked.get_ranked(this.region, this.summoner_data.identifiers.s_id),
            this.lastgames.get_last_games(this.region, this.summoner_data.identifiers.puuid),
            this.livegame.get_livegame(this.region, this.summoner_data.identifiers.s_id),
            this.masteries.get_masteries(this.region, this.summoner_data.identifiers.s_id)
            ]).then(() => {
                return this;
            });
        }
    }
}

module.exports = Profile;