const { SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const get_summoner = require('../../util/functions/league/get_summoner');
const Userdata = require('../../util/classes/userdata');
const error = require('../../util/functions/error');
const MeowDB = require('meowdb');

const userdata = new MeowDB({
    dir: './src/database',
    name: 'userdata',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('link')
        .setDescription('Links your League of Legends account to your Discord account')
        .setDescriptionLocalizations({
            'es-ES': 'Vincula tu cuenta de League of Legends con tu cuenta de Discord',
        })
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Player region').setDescriptionLocalizations({
                'es-ES': 'Región del jugador',
            })
            .setRequired(true)
            .addChoices(
                { name: 'EUW', value: 'euw1' },
                { name: 'EUNE', value: 'eun1' },
                { name: 'NA', value: 'na1' },
                { name: 'BR', value: 'br1' },
                { name: 'LAN', value: 'la1' },
                { name: 'LAS', value: 'la2' },
                { name: 'OCE', value: 'oc1' },
                { name: 'TR', value: 'tr1' },
                { name: 'RU', value: 'ru' },
                { name: 'JP', value: 'jp1' },
                { name: 'KR', value: 'kr' },
            )
        )
        .addStringOption(option => option
            .setName('player').setNameLocalization('es-ES', 'jugador')
            .setDescription('League of Legends username').setDescriptionLocalizations({
                'es-ES': 'Nombre de usuario de League of Legends',
            })
            .setRequired(true)
        ),
    async execute(interaction) {
        var summoner = await get_summoner(interaction);
        if (typeof summoner == 'string') return error(interaction, summoner);

        do {
            var random = Math.floor(Math.random() * 21);
        } while (summoner.data.icon.id == random);

        var requiered_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${random}.jpg`;
        var old_icon = summoner.data.icon.url;

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.link_command.instructions_embed)
            .replace('{{region}}', summoner.region.name)
            .replace('{{name}}', summoner.data.name)
            .replace('{{iconURL}}', summoner.data.icon.url)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setThumbnail(requiered_icon).setTimestamp();

        var row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel(interaction.locale.link_command.button)
                    .setStyle(ButtonStyle.Primary)
            );

        var message = await interaction.channel.send({ embeds: [embed], components: [row] });

        var collector = new InteractionCollector(interaction.client, {
            time: 5 * 60 * 1000,
            max: 1,
            filter: i => i.customId === 'verify' && i.user.id === interaction.user.id
        })
            
        collector.on('collect', async () => {
            var summoner = await get_summoner(interaction);
            if (summoner.data.icon.id != random) return error(interaction, 'link-failed') && await message.delete();

            var account = new Userdata();
            account.set_league(summoner.region.id, summoner.data.identifiers.puuid)

            if (userdata.get(interaction.user.id)) userdata.delete(interaction.user.id);
            userdata.create(interaction.user.id, account);

            var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.link_command.success_embed)
                .replace('{{region}}', summoner.region.name)
                .replace('{{name}}', summoner.data.name)
                .replace('{{iconURL}}', old_icon)
                .replace('{{requester}}', interaction.user.tag)
                .replace('{{requester_icon}}', interaction.user.avatarURL())
            )).setTimestamp();
            await interaction.followUp({ embeds: [embed] });
            await message.delete();
        });

        collector.on('end', async collected => collected.size == 0 ? error(interaction, 'link-timeout') && await message.delete() : null);
    }
}