const Summoner = require('../classes/summoner');
const Region = require('../classes/region');
const MeowDB = require('meowdb');

const db = new MeowDB({
    dir: './src/database',
    name: 'accounts',
});

async function get_user (interaction) {
    var username = interaction.options.getString('jugador') || interaction.options.getString('player');
    var region = interaction.options.getString('region') || interaction.options.getString('región');
    var mención = interaction.options.getUser('mención') || interaction.options.getUser('mention');
    if (!username || !region) {
        var acc = db.get(mención ? mención.id : interaction.user.id);
        if (!acc) return mención ? 'no-linked-member' : 'no-linked-account';
        return {
            puuid: acc.summoner.identifiers.puuid,
            region: acc.region
        };
    }
    var region = new Region().get_region(region);
    var summoner = await new Summoner().get_summoner(region, username);
    if (!summoner.identifiers.s_id) return 'profile-not-found';
    return {
        puuid: summoner.identifiers.puuid,
        region: region,
    }
}

module.exports = get_user;