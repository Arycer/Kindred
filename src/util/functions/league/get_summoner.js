const Summoner = require('../../classes/league/summoner');
const Region = require('../../classes/league/region');
const MeowDB = require('meowdb');

const userdata = new MeowDB({
    dir: './src/database',
    name: 'userdata',
});

async function get_user (interaction) {
    var username = interaction.options.getString('jugador') || interaction.options.getString('player');
    var region = interaction.options.getString('region') || interaction.options.getString('región');
    var mención = interaction.options.getUser('mención') || interaction.options.getUser('mention');
    if (!username || !region) {
        var acc = userdata.get(mención ? mención.id : interaction.user.id);
        if (!acc) return mención ? 'no-linked-member' : 'no-linked-account';
        var region = new Region().get_region(acc.league.region);
        var summoner = await new Summoner().get_summoner(region, acc.league.puuid);
        return {
            data: summoner,
            region: region
        };
    }
    var region = new Region().get_region(region);
    var summoner = await new Summoner().get_summoner(region, username);
    if (!summoner.identifiers.s_id) return 'profile-not-found';
    return {
        data: summoner,
        region: region
    }
}

module.exports = get_user;