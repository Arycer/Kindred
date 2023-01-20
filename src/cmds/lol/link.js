const { SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'interactionCreate',
    data: new SlashCommandSubcommandBuilder()
        .setName('link')
        .setDescription('Link your League of Legends account to your Discord account.'),
    async execute(interaction) {
        var token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var state = Buffer.from(interaction.user.id + ':' + token).toString('base64');
        db.linkedLeague.set(interaction.user.id, { token: token });

        var loginHeaders = { Authorization: process.env.BOT_Secret }
            loginURL = `https://api.arycer.me/kindred/login?auth=${state}`
            loginRequest = await axios.get(loginURL, { headers: loginHeaders });
            loginLink = loginRequest.data.link;

        var embed = new EmbedBuilder()
            .setAuthor({ name: '¡Vinculando tu cuenta!', iconURL: 'https://i.imgur.com/4k5Ztel.jpg' })
            .setDescription(`Para vincular tu cuenta de League of Legends a tu cuenta de Discord, haz clic en el botón de abajo. Si no puedes ver el botón, haz clic [aquí](${loginLink}).`)
            .setColor(6125469)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setTimestamp();

        var row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Iniciar sesión con Riot')
                    .setURL(loginLink)
            );

        interaction.user.send({ embeds: [embed], components: [row] });

        var embed = new EmbedBuilder()
            .setAuthor({ name: '¡Vinculando tu cuenta!', iconURL: 'https://i.imgur.com/4k5Ztel.jpg' })
            .setDescription('Por seguridad, continúa el proceso de vinculación en tus mensajes directos.')
            .setColor(6125469)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setTimestamp();

        interaction.guild ? interaction.followUp({ embeds: [embed] }) : interaction.deleteReply();

        let checkDone = setInterval(() => {
            var dbEntry = db.linkedLeague.get(interaction.user.id);
            if (dbEntry && dbEntry.puuid) {
                var embed = new EmbedBuilder()
                    .setAuthor({ name: '¡Tu cuenta ha sido vinculada!', iconURL: 'https://i.imgur.com/4k5Ztel.jpg' })
                    .setDescription('Tu cuenta de League of Legends ha sido vinculada a tu cuenta de Discord.')
                    .setColor(6125469)
                    .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
                    .setTimestamp();

                interaction.user.send({ embeds: [embed] });
                clearInterval(checkDone);
            }
        }, 1000);

        setTimeout(() => {
            var dbEntry = db.linkedLeague.get(interaction.user.id);
            if (dbEntry && dbEntry.token === token) {
                db.linkedLeague.delete(interaction.user.id);

                var embed = new EmbedBuilder()
                    .setAuthor({ name: '¡Ha ocurrido un error!', iconURL: 'https://i.imgur.com/4k5Ztel.jpg' })
                    .setDescription('El enlace ha caducado. Por favor, inténtalo de nuevo.')
                    .setColor(6125469)
                    .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
                    .setTimestamp();

                interaction.user.send({ embeds: [embed] });
                clearInterval(checkDone);
            }
        }, 1 * 10 * 1000);
    }
}