const { SlashCommandSubcommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('resume')
        .setNameLocalization('es-ES', 'reanudar')
        .setDescription('Reanuda la reproducción'),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return error(interaction, locale, 'no-voice-channel');

        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return error(interaction, locale, 'no-connection');

        const player = connection.state.subscription?.player;    
        if (player.state.status === AudioPlayerStatus.Playing) return error(interaction, locale, 'already-playing');    
        player.unpause();
        
        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.resume_command.embed)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
};
