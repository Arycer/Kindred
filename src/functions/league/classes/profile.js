const Summoner = require('./summoner_data');
const LastGames = require('./last_games');
const Masteries = require('./masteries');
const LiveGame = require('./livegame');
const Ranked = require('./ranked');

class Profile {
    constructor() {
        this.summoner_data = new Summoner();
        this.masteries = new Masteries();
        this.lastgames = new LastGames();
        this.livegame = new LiveGame();
        this.ranked = new Ranked();
    }

    async init(username, interaction) {
        await this.summoner_data.get_summoner(username); var msg = await interaction.channel.send(`Obteniendo datos (1/5)`);
        if (!this.summoner_data.summoner_id) return this;

        await this.masteries.get_masteries(this.summoner_data.summoner_id); await msg.edit(`Obteniendo datos (2/5)`);
        await this.livegame.get_livegame(this.summoner_data.summoner_id); await msg.edit(`Obteniendo datos (3/5)`);
        await this.lastgames.get_last_games(this.summoner_data.puuid); await msg.edit(`Obteniendo datos (4/5)`);
        await this.ranked.get_ranked(this.summoner_data.summoner_id); await msg.edit(`Obteniendo datos (5/5)`);
        await msg.delete();
        return this;
    }
}

module.exports = Profile;