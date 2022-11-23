const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Activa o desactiva la canción actual')
        .addBooleanOption(option =>
            option.setName('activar')
                .setDescription('Activar o desactivar el bucle')),
    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });

            const connection = getVoiceConnection(interaction.guildId);
            if (!connection) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

            const player = connection.state.subscription?.player;
            if (!player) return interaction.reply({ content: '¡No estás reproduciendo música!', ephemeral: true });

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

