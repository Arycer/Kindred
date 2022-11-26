const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Desvincula tu cuenta de League of Legends de tu cuenta de Discord'),
    async execute(interaction) {
        const db = interaction.client.database;
        const entry = db.get(interaction.user.id);

        if (!entry) {
            var embed = new EmbedBuilder()
                .setAuthor({ name: `¡Algo ha salido mal!`, iconURL: `https://media.discordapp.net/attachments/1040519867578728481/1046022952547786842/939.jpg`})
                .setThumbnail('https://media.discordapp.net/attachments/1040519867578728481/1044017562775719967/unknown.png')
                .setTitle(`Esto es lo que ha pasado:`)
                .setDescription(`No tienes ninguna cuenta vinculada. Vincula una cuenta con el comando /link`)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setColor('#5d779d')
                .setTimestamp();
            return await interaction.followUp({ embeds: [embed] });
        }

        db.delete(interaction.user.id);

        var embed = new EmbedBuilder()
            .setAuthor({ name: `¡Todo listo!`, iconURL: `https://media.discordapp.net/attachments/1040519867578728481/1046022952547786842/939.jpg`})
            .setThumbnail('https://media.discordapp.net/attachments/1040519867578728481/1044017541594501220/unknown.png')
            .setTitle(`Tu cuenta ha sido desvinculada correctamente.`)
            .setDescription(`Puedes volver a vincular tu cuenta con el comando /link`)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
            .setColor('#5d779d')
            .setTimestamp();
        await interaction.followUp({ embeds: [embed] });
    }
};
