const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const error = require('../../../util/error');

async function run(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.followUp({ embeds: [error('es-ES', 'no-voice-channel', interaction.user.tag)] });

        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) return interaction.followUp({ embeds: [error('es-ES', 'no-connection', interaction.user.tag)] });

        const queue = connection.queue;

        const loop = interaction.options.getBoolean('activar') || interaction.options.getBoolean('enable');
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
    
    module.exports = run;