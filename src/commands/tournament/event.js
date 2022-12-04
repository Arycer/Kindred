const { SlashCommandSubcommandBuilder } = require('discord.js');
const MeowDB = require('meowdb');

const servers = new MeowDB({
    dir: './src/database',
    name: 'servers',
});

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('event').setNameLocalization('es-ES', 'evento')
        .setDescription('Crea un evento para el torneo especificado.')
        .addIntegerOption(option => option
            .setName('id')
            .setDescription('Tournament ID.').setDescriptionLocalization('es-ES', 'ID del torneo.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('map').setNameLocalization('es-ES', 'mapa')
            .setDescription('Event map.').setDescriptionLocalization('es-ES', 'Mapa del evento.')
            .setRequired(true)
            .addChoices(
                { name: 'Summoner\'s Rift', value: 'SUMMONERS_RIFT', name_localizations: { 'es-ES': 'Grieta del Invocador' } },
                { name: 'Howling Abyss', value: 'HOWLING_ABYSS', name_localizations: { 'es-ES': 'Abismo de los Lamentos' } },
            )
        )
        .addIntegerOption(option => option
            .setName('teams').setNameLocalization('es-ES', 'equipos')
            .setDescription('Team size (min. 1, max 5).').setDescriptionLocalization('es-ES', 'Tamaño del equipo (mín 1, máx 5).')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(5)
        )
        .addStringOption(option => option
            .setName('spectators').setNameLocalization('es-ES', 'espectadores')
            .setDescription('Spectators mode.').setDescriptionLocalization('es-ES', 'Modo de espectadores.')
            .setRequired(true)
            .addChoices(
                { name: 'All', value: 'ALL', name_localizations: { 'es-ES': 'Todos' } },
                { name: 'Lobby Only', value: 'LOBBYONLY', name_localizations: { 'es-ES': 'Solo lobby' } },
                { name: 'None', value: 'NONE', name_localizations: { 'es-ES': 'Nadie' } }
            )
        )
        .addStringOption(option => option
            .setName('mode').setNameLocalization('es-ES', 'modo')
            .setDescription('Game mode.').setDescriptionLocalization('es-ES', 'Modo de juego.')
            .setRequired(true)
            .addChoices(
                { name: 'Blind Pick', value: 'BLIND_PICK', name_localizations: { 'es-ES': 'A ciegas' } },
                { name: 'Draft Mode', value: 'DRAFT_MODE', name_localizations: { 'es-ES': 'Reclutamiento' } },
                { name: 'All Random', value: 'ALL_RANDOM', name_localizations: { 'es-ES': 'Todo aleatorio' } },
                { name: 'Tournament Draft', value: 'TOURNAMENT_DRAFT', name_localizations: { 'es-ES': 'Torneo de reclutamiento' } }
            )
        )
        .addStringOption(option => option
            .setName('name').setNameLocalization('es-ES', 'nombre')
            .setDescription('Event name.').setDescriptionLocalization('es-ES', 'Nombre del evento.')
            .setRequired(true))
        .addRoleOption(option => option
            .setName('invited').setNameLocalization('es-ES', 'invitados')
            .setDescription('Invited role (must be registered with /lol link).').setDescriptionLocalization('es-ES', 'Rol de invitados (deben estar registrados con /lol vincular).')
            .setRequired(true))
        .addChannelOption(option => option
            .setName('channel').setNameLocalization('es-ES', 'canal')
            .setDescription('Channel to send the results message.').setDescriptionLocalization('es-ES', 'Canal para enviar el mensaje de los resultados.')
            .setRequired(true)),
    async execute(interaction) {
        var lang = await servers.get(interaction.guild.id).language;
        var run = require(`./${lang}/event.js`);
        return await run(interaction);
    }
};