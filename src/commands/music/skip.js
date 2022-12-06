const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song')
        .setDescriptionLocalization('es-ES', 'Salta la canción actual'),
    async execute(interaction) {
        const lang = servers.get(interaction.guild.id).language;
        const locale = require(`../../locales/${lang}.json`);

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return error(interaction, locale, 'no-voice-channel');
        
        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return error(interaction, locale, 'no-connection')
        
        const player = connection.state.subscription?.player;
        player.stop();

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.skip_command.embed)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    } 
};