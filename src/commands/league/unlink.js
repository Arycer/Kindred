const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const MeowDB = require('meowdb');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('unlink')
        .setDescription('Desvincula tu cuenta de League of Legends de tu cuenta de Discord'),
    async execute(interaction) {
        var db = new MeowDB({
            dir: './src/database',
            name: 'accounts'
        });
        
        var entry = db.get(interaction.user.id);

        if (!entry) return interaction.followUp({ embeds: [error('No tienes ninguna cuenta enlazada.', interaction.user.tag)] });

        db.delete(interaction.user.id);

        var embed = new EmbedBuilder()
            .setAuthor({ name: `¡Todo listo!`, iconURL: `https://i.imgur.com/hGG9kLU.png`})
            .setThumbnail('https://i.imgur.com/BQUpB5n.png')
            .setTitle(`Tu cuenta ha sido desvinculada correctamente.`)
            .setDescription(`Puedes volver a vincular tu cuenta con el comando /link`)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
            .setColor('#5d779d')
            .setTimestamp();
        await interaction.followUp({ embeds: [embed] });
    }
};
