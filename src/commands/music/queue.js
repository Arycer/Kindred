const { SlashCommandSubcommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database/',
    name: 'servers',
})

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('queue')
        .setNameLocalization('es-ES', 'cola')
        .setDescription('Shows the music queue')
        .setDescriptionLocalization('es-ES', 'Muestra la cola de reproducción'),
    async execute(interaction) {
        const lang = servers.get(interaction.guild.id).language;
        const locale = require(`../../locales/${lang}.json`);

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return error(interaction, locale, 'no-voice-channel');

        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return error(interaction, locale, 'no-connection');

        const requester = interaction.user.tag;
        const queue = connection.queue;

        var embed = new EmbedBuilder(JSON.parse(JSON.stringify(locale.queue_command.embed)
            .replace('{{hyperlink}}', hyperlink(queue.current.title, queue.current.url))
            .replace('{{requester}}', requester).replace('{{requester_icon}}', interaction.user.avatarURL())
        )).setTimestamp();

        if (queue.songs.length == 0) {
            embed.addFields(locale.queue_command.empty)
        } else {
            for (var i = 0; i < queue.songs.length; i++) {
                embed.addFields({
                    name: locale.queue_command.fields.name.replace('{{index}}', i + 1).replace('{{title}}', queue.songs[i].title),
                    value: locale.queue_command.fields.value.replace('{{requester}}', queue.songs[i].requester)
                })
            }
        }

        return interaction.followUp({ embeds: [embed] });
    }
}