const Summoner = require('./summoner_data');
const LastGames = require('./last_games');
const Masteries = require('./masteries');
const LiveGame = require('./livegame');
const Ranked = require('./ranked');
const Region = require('./region');

class Profile {
    constructor() {
        this.summoner_data = new Summoner();
        this.masteries = new Masteries();
        this.lastgames = new LastGames();
        this.livegame = new LiveGame();
        this.ranked = new Ranked();
        this.region = new Region();
    }

    async init(region, username, interaction) {
        this.region.get_region(region);
        await this.summoner_data.get_summoner(this.region, username); var msg = await interaction.channel.send(`Obteniendo datos (1/5)`);

        if (!this.summoner_data.summoner_id) {
            await msg.delete();
            return this;
        }

        var s_data = this.summoner_data;

        await this.masteries.get_masteries(this.region, s_data.summoner_id); await msg.edit(`Obteniendo datos (2/5)`);
        await this.livegame.get_livegame(this.region, s_data.summoner_id); await msg.edit(`Obteniendo datos (3/5)`);
        await this.lastgames.get_last_games(this.region, s_data.puuid); await msg.edit(`Obteniendo datos (4/5)`);
        await this.ranked.get_ranked(this.region, s_data.summoner_id); await msg.edit(`Obteniendo datos (5/5)`);

        await msg.delete();
        return this;
    }
}

module.exports = Profile;