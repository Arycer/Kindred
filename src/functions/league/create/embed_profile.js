const { EmbedBuilder } = require('discord.js');
const Profile = require('../classes/profile');

async function embed_profile(username, interaction) {
    const profile = new Profile();
    await profile.init(username, interaction);
    var m_text = ``;
    for (var i = 0; i < 3; i++) {
        if (profile.mastery.champions[i].text) {
            m_text += `${profile.mastery.champions[i].text}\n`;
        } else {
            m_text += `No hay datos para mostrar.\n`;
        }
    }
    var r_field = {
        name: 'Estadísticas de Ranked',
        value: `<:unranked:1043560446357143592> Sin Clasificar`,
        inline: true
    };
    if (profile.ranked.solo.text != 'Unranked') {
        r_field = {
            name: 'Estadísticas de Solo/Dúo',
            value: profile.ranked.solo.text,
            inline: true
        }
    } else {
        if (profile.ranked.flex.text != 'Unranked') {
            r_field = {
                name: 'Estadísticas de Flex',
                value: profile.ranked.flex.text,
                inline: true
            }
        }
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: profile.summoner_data.name, iconURL: profile.summoner_data.profile_icon, url: profile.summoner_data.url })
        .setDescription(`**Esto es lo que he encontrado:**`)
        .addFields({ name: 'Nivel', value: `${profile.summoner_data.summoner_level}`, inline: true },
                   { name: 'Puntuación de maestría', value: `${profile.mastery.score} puntos en total`, inline: true },
                   { name: 'Últimas 10 partidas', value: `${profile.history.last_10.winrate}% WR`, inline: true },
                   { name: 'Mejores campeones', value: `${m_text}`, inline: true }, r_field,
                   { name: 'Jugando ahora:', value: `${profile.livegame.text}`, inline: false },
                   { name: 'Última partida:', value: `${profile.history.last_10.matches[0].text}`, inline: false })
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
        .setColor('#5d779d')
        .setTimestamp()
    return embed;
}

module.exports = embed_profile;