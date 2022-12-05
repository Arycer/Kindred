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
        if (acc) {
            return {
                id: acc.summoner.identifiers.puuid,
                region: acc.region.id,
            };
        } else {
            return null;
        }
    }

    return {
        id: username,
        region: region,
    };
}

module.exports = get_user;