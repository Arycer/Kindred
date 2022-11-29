const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const error = require('../../util/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('loop')
        .setDescription('Activa o desactiva la canción actual')
        .addBooleanOption(option =>
            option.setName('activar')
                .setDescription('Activar o desactivar el bucle')),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.followUp({ embeds: [error('Debes estar en un canal de voz para usar este comando.', interaction.user.tag)] });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.followUp({ embeds: [error('No estoy reproduciendo nada en este servidor.', interaction.user.tag)] });

            const queue = connection.queue;

            const loop = interaction.options.getBoolean('activar');
            if (!loop) queue.loop = !queue.loop;
            else queue.loop = loop;

            const embed = new EmbedBuilder()
                .setAuthor({ name: '🎵 Se ha cambiado el modo de bucle.' })
                .setDescription(`Usa /loop para activar o desactivar el modo de bucle.`)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setColor('#5d779d')
                .setTimestamp();
            if (queue.loop) {
                embed.setTitle(`El modo de bucle está activado.`);
            } else {
                embed.setTitle(`El modo de bucle está desactivado.`);
            }

            await interaction.followUp({ embeds: [embed] });
        }
        catch (error) {
            console.log(error);
        }
    }
};

