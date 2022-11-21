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
        var msg = await interaction.channel.send({ content: 'Cargando perfil...' });
        return this.summoner_data.get_summoner(this.region, username).then(async (summoner) => {
            this.summoner_data = summoner;

            if (!this.summoner_data.summoner_id) {
                await msg.delete();
                return this;
            }

            var s_data = this.summoner_data;

            await msg.edit({ content: 'Cargando maestrías...' });
            await this.masteries.get_masteries(this.region, s_data.summoner_id).then(masteries => {
                this.masteries = masteries;
            });

            await msg.edit({ content: 'Cargando rankeds...' });
            await this.ranked.get_ranked(this.region, s_data.summoner_id).then(ranked => {
                this.ranked = ranked;
            });

            await msg.edit({ content: 'Cargando partidas...' });
            await this.livegame.get_livegame(this.region, s_data.summoner_id).then(livegame => {
                this.livegame = livegame;
            });
            await this.lastgames.get_last_games(this.region, s_data.puuid).then(lastgames => {
                this.lastgames = lastgames;
            });

            await msg.delete();
        });
    }
}

module.exports = Profile;