const { EmbedBuilder, PermissionsBitField, channelMention, spoiler } = require('discord.js');
const error = require('../../../util/error');
const MeowDB = require('meowdb');
const axios = require('axios');

const accounts = new MeowDB({
    dir: './src/database',
    name: 'accounts'
});

async function run (interaction) {
    var tournamentId = interaction.options.getInteger('id');
    var map = interaction.options.getString('mapa') || interaction.options.getString('map');
    var size = interaction.options.getInteger('equipos') || interaction.options.getInteger('teams');
    var spectators = interaction.options.getString('espectadores') || interaction.options.getString('spectators');
    var pickType = interaction.options.getString('modo') || interaction.options.getString('mode');
    var name = interaction.options.getString('nombre') || interaction.options.getString('name');
    var invitedRole = interaction.options.getRole('invitados') || interaction.options.getRole('invited');
    var channel = interaction.options.getChannel('canal') || interaction.options.getChannel('channel');
    
    if (!channel.permissionsFor(interaction.client.user).has(new PermissionsBitField('SendMessages'))) {
        return interaction.followUp({ embeds: [error('es-ES', 'no-perms-bot', interaction.user.tag)] });
    }

    var role = interaction.guild.roles.cache.get(invitedRole.id);
    var invitedUsers = role.members.map(member => member.user.id);
    
    var invitedIds = [];
    for (var i = 0; i < invitedUsers.length; i++) {
        var entry = accounts.get(invitedUsers[i]);
        if (!entry) continue;

        var puuid = entry.summoner.identifiers.puuid;
        var region = entry.region;

        var id = await convert_id(region, puuid);
        if (!id) continue;

        invitedIds.push(id);
    }

    var post = {
        allowedSummonerIds: invitedIds,
        mapType: map,
        metadata: `{'title':'${name}', 'channel':'${channel.id}'}, 'lang':'es-ES'`,
        pickType: pickType,
        spectatorType: spectators,
        teamSize: size
    };

    var endpoint = `https://americas.api.riotgames.com/lol/tournament/v4/codes?count=1&tournamentId=${tournamentId}&api_key=${process.env.TOURNAMENT_API_KEY}`;
    var code = await axios.post(endpoint, JSON.stringify(post))
        .then(response => {
            return response.data[0];
        })
        .catch(err => {
            if (err.response.data.status.message.includes('enoughPlayers')) {
                interaction.followUp({ embeds: [error('es-ES', 'not-enough-players', interaction.user.tag)] });
                return null;
            } else if (err.response.data.status.message.includes('NumberFormatException')) {
                interaction.followUp({ embeds: [error('es-ES', 'invalid-id', interaction.user.tag)] });
                return null;
            } else {
                interaction.followUp({ embeds: [error('es-ES', 'unknown', interaction.user.tag)] });
                console.log(err.response.data);
                return null;
            }
        });

    if (!code) return;

    var selección = '';
    switch (pickType) {
        case 'BLIND_PICK':
            selección = 'A ciegas';
            break;
        case 'DRAFT_MODE':
            selección = 'Reclutamiento';
            break;
        case 'ALL_RANDOM':
            selección = 'Todo aleatorio';
            break;
        case 'TOURNAMENT_DRAFT':
            selección = 'Torneo de reclutamiento';
            break;
    }

    var mapa = '';
    switch (map) {
        case 'SUMMONERS_RIFT':
            mapa = 'Grieta del Invocador';
            break;
        case 'HOWLING_ABYSS':
            mapa = 'Abismo de los Lamentos';
            break;
    } 

    var espectadores = '';
    switch (spectators) {
        case 'LOBBYONLY':
            espectadores = 'Sólo invitados';
            break;
        case 'ALL':
            espectadores = 'Todos';
            break;
        case 'NONE':
            espectadores = 'Nadie';
            break;
    }

    var embed = new EmbedBuilder()
        .setAuthor({ name: 'Kindred Bot - Torneos', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
        .setTitle('¡Evento creado!')
        .setDescription(`El evento **${name}** ha sido creado con éxito. Detalles del evento:`)
        .addFields(
            { name: 'Mapa', value: mapa, inline: true },
            { name: 'Tamaño de los equipos', value: `${size} jugadores`, inline: true },
            { name: 'Selección', value: selección, inline: true },
            { name: 'Espectadores', value: espectadores, inline: true },
            { name: 'Canal de resultados', value: channelMention(channel.id), inline: true },
            { name: 'Código', value: spoiler(code), inline: true }
        )
        .setFooter({ text: `¡Añádeme a tu servidor! - bit.ly/3F4vQ9v` })
        .setColor('#5d779d')
        .setTimestamp();

    return interaction.followUp({ embeds: [embed] });
}

async function convert_id (region, puuid) {
    async function get_name (region, puuid) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        var opts = {
            headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
            },
            timeout: 2000
        };
    
        var name = await axios.get(endpoint, opts)
            .then(res => res.data.name)
            .catch(err => {
                if (err.code === 'ECONNABORTED') {
                    return get_name(region, puuid);
                }
                else {
                    console.log(err);
                    return null;
                }
            });
    
        if (!name) return null;
        return name;
    }

    var name = await get_name(region, puuid);

    async function get_id (region, name) {
        var endpoint = `https://${region.id}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`;
        var opts = {
            headers: {
                'X-Riot-Token': process.env.TOURNAMENT_API_KEY
            },
            timeout: 2000
        };
    
        var response = await axios.get(endpoint, opts)
            .then(response => {
                var data = response.data;
                return data.id;
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    return get_id(region, name);
                }
                else {
                    console.log(error);
                    return null;
                }
            });
    
        return response;
    }

    var id = await get_id(region, name);
    return id;
}

module.exports = run;