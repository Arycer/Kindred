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
        .setName('loop')
        .setNameLocalization('es-ES', 'bucle')
        .setDescription('Enables or disables loop mode')
        .setDescriptionLocalization('es-ES', 'Activa o desactiva el modo de bucle')
        .addBooleanOption(option =>
            option.setName('enable')
                .setNameLocalization('es-ES', 'activar')
                .setDescription('Enables or disables loop mode')
                .setDescriptionLocalization('es-ES', 'Activar o desactivar el bucle')),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var locale = require(`../../locales/${lang}.json`);

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return error(interaction, locale, 'no-voice-channel');

        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return error(interaction, locale, 'no-connection');

        const queue = connection.queue;
        const loop = interaction.options.getBoolean('activar') || interaction.options.getBoolean('enable');
        queue.loop = loop ? loop : !queue.loop;

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.loop_command.embed)
            .replace('{{action}}', queue.loop ? locale.loop_command.actions.enable : locale.loop_command.actions.disable)
            .replace('{{requester}}', interaction.user.tag)
            .replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();
        return interaction.followUp({ embeds: [embed] });
    }
}