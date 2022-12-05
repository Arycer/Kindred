const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers'
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('live')
        .setDescription('Shows the live game of a summoner').setDescriptionLocalization('es-ES', 'Muestra la partida en vivo de un invocador')
        .addStringOption(option => option
            .setName('region').setNameLocalization('es-ES', 'región')
            .setDescription('Player region').setDescriptionLocalization('es-ES', 'Región del jugador')
            .setRequired(false)
            .addChoices(
                { name: 'EUW', value: 'euw1' },
                { name: 'EUNE', value: 'eun1' },
                { name: 'NA', value: 'na1' },
                { name: 'BR', value: 'br1' },
                { name: 'LAN', value: 'la1' },
                { name: 'LAS', value: 'la2' },
                { name: 'OCE', value: 'oc1' },
                { name: 'TR', value: 'tr1' },
                { name: 'RU', value: 'ru' },
                { name: 'JP', value: 'jp1' },
                { name: 'KR', value: 'kr' },
                )
            )
            .addStringOption(option => option
                .setName('player').setNameLocalization('es-ES', 'jugador')
                .setDescription('League of Legends username').setDescriptionLocalization('es-ES', 'Nombre de usuario de League of Legends')
                .setRequired(false))
            .addUserOption(option => option
                .setName('metion').setNameLocalization('es-ES', 'mención')
                .setDescription('Discord user').setDescriptionLocalization('es-ES', 'Usuario de Discord')
                .setRequired(false)),
    async execute(interaction) {
        var lang = servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/live`);
        return await run(interaction);
    }
}