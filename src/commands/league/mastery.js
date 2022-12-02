const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const get_emote = require('../../league/functions/get_emote');
const Masteries = require('../../league/classes/masteries');
const Summoner = require('../../league/classes/summoner');
const Champion = require('../../league/classes/champion');
const Region = require('../../league/classes/region');
const error = require('../../util/error');
const MeowDB = require('meowdb');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('mastery')
        .setDescription('Muestra las mejores maestrías de un jugador')
        .addStringOption(option => 
            option.setName('region')
                .setDescription('Región del usuario')
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
                ))
            .addStringOption(option => option.setName('usuario').setDescription('Nombre de usuario de League of Legends').setRequired(false))
            .addUserOption(option => option.setName('mención').setDescription('Usuario de Discord').setRequired(false)),
    async execute(interaction) {
        var username = interaction.options.getString('usuario');
        var region = interaction.options.getString('region');
        var mención = interaction.options.getUser('mención');

        var db = new MeowDB({
            dir: './src/database',
            name: 'accounts'
        });

        if (!username || !region) {
            if (mención) {
                var acc = db.get(mención.id);
                if (!acc) return interaction.followUp({ embeds: [error('El usuario no tiene ninguna cuenta enlazada.', interaction.user.tag)] });
                var puuid = acc.summoner.identifiers.puuid;
                region = acc.region.id;

            } else {
                var acc = db.get(interaction.user.id);
                if (!acc) return interaction.followUp({ embeds: [error('No tienes ninguna cuenta enlazada.', interaction.user.tag)] });
                var puuid = acc.summoner.identifiers.puuid;
                region = acc.region.id;
            }
        }

        // pa mañana q hay sueño xd
        interaction.followUp({ embeds: [error('Comando en desarrollo.', interaction.user.tag)] });
    }
}