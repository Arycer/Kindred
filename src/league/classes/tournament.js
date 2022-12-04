const Summoner = require('./summoner');
const Region = require('./region');
const Match = require('./match');

class TournamentGame {
    constructor () {
        this.region = new Region();
        this.timestamp = null;
        this.channel = null;
        this.gameId = null;
        this.title = null;

        this.participants = {
            winningTeam: [],
            losingTeam: []
        }

        this.map = null;
    }

    async init (callback_data) {
        this.region.get_region(callback_data.region.toLowerCase());
        this.gameId = callback_data.region + '_' + callback_data.gameId;
        
        for (var i = 0; i < callback_data.winningTeam.length; i++) {
            var summoner = await new Summoner().get_summoner(this.region, callback_data.winningTeam[i].summonerName);
            var match = await new Match().get_match(this.region, this.gameId, summoner.identifiers.puuid);
            this.participants.winningTeam.push({
                summoner: summoner,
                match: match
            });
        }

        for (var i = 0; i < callback_data.losingTeam.length; i++) {
            var summoner = await new Summoner().get_summoner(this.region, callback_data.losingTeam[i].summonerName);
            var match = await new Match().get_match(this.region, this.gameId, summoner.identifiers.puuid);
            this.participants.losingTeam.push({
                summoner: summoner,
                match: match
            });
        }
            
        this.map = callback_data.gameMap;
        this.timestamp = callback_data.startTime;
        this.channel = callback_data.metaData.channel;
        this.title = callback_data.metaData.title;
        this.lang = callback_data.metaData.lang;

        return this;
    }
}


module.exports = TournamentGame;