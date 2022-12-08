const Summoner = require('../../classes/league/summoner');
const Region = require('../../classes/league/region');
const MeowDB = require('meowdb');

const userdata = new MeowDB({
    dir: './src/database',
    name: 'userdata',
});

async function get_user (interaction) {
    if (interaction.options._hoistedOptions.length < 2 || interaction.options.getUser('user')) {
        var user = interaction.options.getUser('user') || interaction.user
        var acc = userdata.get(user.id).league;
        if (!acc) return interaction.options.getUser('user') ? 'no-linked-member' : 'no-linked-account';
        var region = new Region().get_region(acc.region);
        var summoner = await new Summoner().get_summoner(region, acc.puuid);
        return {
            data: summoner,
            region: region
        };
    }
    var region = new Region().get_region(interaction.options.getString('region'));
    var summoner = await new Summoner().get_summoner(region, interaction.options.getString('name'));
    if (!summoner.identifiers.s_id) return 'profile-not-found';
    return {
        data: summoner,
        region: region
    }
}

module.exports = get_user;