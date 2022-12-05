const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const Account = require('../../../util/league/classes/account');
const error = require('../../../util/error');
const MeowDB = require('meowdb');

async function execute(interaction) {
    const username = interaction.options.getString('jugador') || interaction.options.getString('player');
    const region = interaction.options.getString('region') || interaction.options.getString('región');

    const account = new Account();

    account.region.get_region(region);

    var summoner = await account.summoner.get_summoner(account.region, username);

    if (!summoner.identifiers.s_id) return interaction.followUp({ embeds: [error('en-US', 'profile-not-found', interaction.user.tag)] });

    do {
        var random = Math.floor(Math.random() * 21);
    } while (summoner.icon.id == random);

    var requiered_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${random}.jpg`;
    var old_icon = summoner.icon.url;

    var embed = new EmbedBuilder()
        .setAuthor({ name: `${account.region.name} - ${summoner.name}`, iconURL: summoner.icon.url})
        .setTitle('Linking account! Here are the steps:')
        .setDescription(`To link your account, you must change your profile icon to the one shown below. Once you have done this, click on the button below. You have 1 minute to do this.`)
        .setThumbnail(requiered_icon)
        .setColor('#5d779d')
        .setFooter({ text: `Requested by ${interaction.user.username}`})
        .setTimestamp();
    
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verify')
                .setLabel('I changed my icon!')
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
            return interaction.followUp({ embeds: [error('en-US', 'link-failed', interaction.user.tag)] });
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
            .setTitle('All set!')
            .setDescription(`Your account has been linked successfully.`)
            .setThumbnail(`https://i.imgur.com/K7uO7Eh.png`)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
        await msg.delete();
    });

    collector.on('end', async collected => {
        if (collected.size == 0) {
            await msg.delete();
            return interaction.followUp({ embeds: [error('en-US', 'link-timeout', interaction.user.tag)] });
        }
    });
}

module.exports = execute;