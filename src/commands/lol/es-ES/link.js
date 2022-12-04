const { SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const Account = require('../../league/classes/account');
const error = require('../../util/error');
const MeowDB = require('meowdb');

async function execute(interaction) {
    const username = interaction.options.getString('jugador') || interaction.options.getString('player');
    const region = interaction.options.getString('region') || interaction.options.getString('región');

    const account = new Account();

    account.region.get_region(region);

    var summoner = await account.summoner.get_summoner(account.region, username);

    if (!summoner.identifiers.s_id) return interaction.followUp({ embeds: [error('es-ES', 'profile-not-found', interaction.user.tag)] });

    do {
        var random = Math.floor(Math.random() * 21);
    } while (summoner.icon.id == random);

    var requiered_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${random}.jpg`;
    var old_icon = summoner.icon.url;

    var embed = new EmbedBuilder()
        .setAuthor({ name: `${account.region.name} - ${summoner.name}`, iconURL: summoner.icon.url})
        .setTitle('¡Enlazando cuenta! Esto es lo que debes hacer:')
        .setDescription(`Para verificar tu cuenta, debes cambiar tu icono de perfil al que aparece en este mensaje. Después, pulsa el botón a continuación. Debes hacerlo en un plazo de un minuto, o la operación se cancelará.`)
        .setThumbnail(requiered_icon)
        .setColor('#5d779d')
        .setFooter({ text: `Solicitado por ${interaction.user.username}`})
        .setTimestamp();
    
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verify')
                .setLabel('¡He cambiado mi icono!')
                .setStyle(ButtonStyle.Primary)
        );

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

    const collector = new InteractionCollector(interaction.client, { 
        time: 60000,
        max: 1,
        filter: i => i.customId === 'verify' && i.user.id === interaction.user.id
    });

    collector.on('collect', async () => {
        var summoner = await account.summoner.get_summoner(account.region, username);

        if (!summoner.icon.id == random) {
            await msg.delete();
            return interaction.followUp({ embeds: [error('es-ES', 'link-failed', interaction.user.tag)] });
        }

        account.discord_id = interaction.user.id;
        account.summoner = summoner;

        var db = new MeowDB({
            dir: './src/database',
            name: 'accounts'
        });

        if (db.get(interaction.user.id)) db.delete(interaction.user.id);
        db.create(interaction.user.id, account);

        var embed = new EmbedBuilder()
            .setColor('#5d779d')
            .setAuthor({ name: `${account.region.name} - ${account.summoner.name}`, iconURL: old_icon })
            .setTitle('¡Todo listo!')
            .setDescription(`Tu cuenta ha sido vinculada correctamente.` )
            .setThumbnail(`https://i.imgur.com/K7uO7Eh.png`)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
        await msg.delete();
    });

    collector.on('end', async collected => {
        if (collected.size == 0) {
            await msg.delete();
            return interaction.followUp({ embeds: [error('es-ES', 'link-timeout', interaction.user.tag)] });
        }
    });
}

module.exports = execute;