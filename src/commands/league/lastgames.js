const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const Summoner = require('../../league/classes/summoner_data');
const get_emote = require('../../league/functions/get_emote');
const LastGames = require('../../league/classes/last_games');
const Region = require('../../league/classes/region');
const error = require('../../league/functions/error');
const MeowDB = require('meowdb');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('lastgames')
        .setDescription('Muestra las últimas 10 partidas de un jugador')
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

        const summoner = new Summoner();
        const server = new Region().get_region(region);
        await summoner.get_summoner(server, puuid ? puuid : username);
        
        if (!summoner.identifiers.s_id) return interaction.followUp({ embeds: [error('No he podido encontrar al usuario especificado. Asegúrate de que la región es correcta y que el nombre de usuario es correcto', interaction.user.tag)] });

        const last_games = new LastGames();
        await last_games.get_last_games(server, summoner.identifiers.puuid);

        var embed = new EmbedBuilder()
            .setAuthor({ name: `Últimas 10 partidas de ${summoner.name} - ${last_games.winrate}% WR`, iconURL: summoner.icon.url })
            .setColor('#5d779d')
            .setFooter({ text: `Solicitado por ${interaction.user.username}`})
            .setTimestamp();

        for (var i = 0; i < last_games.matches.length; i++) {
            var game = last_games.matches[i];
            var champ = `${game.champion.emote} ${game.champion.name}`;
            var win = game.stats.win;
            var kills = game.stats.kills;
            var deaths = game.stats.deaths;
            var assists = game.stats.assists;
            var cs = game.stats.cs;
            var cs_per_min = game.stats.cs_per_min;
            var cs_e = get_emote('minioncount');

            var duration = `${Math.floor(game.time.duration / 60)}:${game.time.duration % 60 < 10 ? '0' + game.time.duration % 60 : game.time.duration % 60}`;
            var wintext = typeof win === 'boolean' ? win ? `🟢 **Victoria**` : `🔴 **Derrota**` : `⚙️ **Remake**`;
            var url = `https://www.leagueofgraphs.com/es/match/${server.name.toLowerCase()}/${game.game_id.split('_')[1]}`;

            embed.addFields({
                name: `${wintext} - ${champ} - ${game.map.name} - ${game.queue.name}`,
                value: `🕐 Duración: ${duration} | KDA: ${kills}/${deaths}/${assists} | CS: ${cs} ${cs_e} (${cs_per_min}/min) | [🔗 Más](${url})`,
            })
        }
        return await interaction.followUp({ embeds: [embed] });
    }
}