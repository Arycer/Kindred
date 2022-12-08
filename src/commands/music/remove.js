const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/functions/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Removes a song from the queue')
        .setDescriptionLocalization('es-ES', 'Elimina una canción de la cola de reproducción')
        .addIntegerOption(option => 
            option.setName('position')
                .setNameLocalization('es-ES', 'posición')
                .setDescription('Song position')
                .setDescriptionLocalization('es-ES', 'Posición de la canción')
                .setRequired(true)),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return error(interaction, interaction.locale, 'no-voice-channel');
    
        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return error(interaction, interaction.locale, 'no-connection');

        const queue = connection.queue;
        if (queue.songs.length == 0) return error(interaction, interaction.locale, 'empty-queue');

        const index = interaction.options.getInteger('posición') || interaction.options.getInteger('position');
        if (index - 1 < 0 || index - 1 >= queue.songs.length) return error(interaction, interaction.locale, 'invalid-position');
        
        var song = queue.songs.splice(index - 1, 1)[0];
        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(interaction.locale.remove_command.embed)
            .replace('{{requester}}', song.requester)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTitle(song.title).setURL(song.url).setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
}