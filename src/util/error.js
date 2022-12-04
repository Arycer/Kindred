const { EmbedBuilder } = require('discord.js');

function error (lang, type, requester) {
    if (lang === 'es-ES') {
        var embed = new EmbedBuilder()
            .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
            .setTitle('Esto es lo que ha pasado:')
            .setThumbnail('https://i.imgur.com/81rFFJy.png')
            .setColor('#5d779d')
            .setFooter({ text: `Solicitado por ${requester}`})
            .setTimestamp();
        switch (type) {
            case 'no-perms':
                embed.setDescription('No tienes permisos para ejecutar este comando.');
                break;
            case 'profile-not-found':
                embed.setDescription('El perfil que has solicitado no existe.');
                break;
            case 'champ-not-found':
                embed.setDescription('No se ha encontrado el campeón especificado.');
                break;
            case 'build-not-found':
                embed.setDescription('No se ha encontrado la build para el campeón en la línea que me has pedido.');
                break;
            case 'runes-not-found':
                embed.setDescription('No se han encontrado las runas para el campeón en la línea que me has pedido.');
                break;
            case 'no-linked-account':
                embed.setDescription('No tienes ninguna cuenta de League of Legends vinculada a tu perfil de Discord.');
                break;
            case 'no-linked-member':
                embed.setDescription('El usuario que me has mencionado no tiene ninguna cuenta de League of Legends vinculada a su perfil de Discord.');
                break;
            case 'link-timeout':
                embed.setDescription('Se ha agotado el tiempo de espera para vincular tu cuenta de League of Legends. Vuelve a intentarlo.');
                break;
            case 'link-failed':
                embed.setDescription('No has cambiado tu icono de perfil de League of Legends a la imagen que te he enviado. Vuelve a intentarlo.');
                break;
            case 'not-in-game':
                embed.setDescription('El jugador que buscas no está en partida.');
                break;
            case 'no-mastery':
                embed.setDescription('El jugador que buscas no tiene maestrías.');
                break;
            case 'no-voice-channel':
                embed.setDescription('Debes estar en un canal de voz para ejecutar este comando.');
                break;
            case 'no-connection':
                embed.setDescription('No estoy conectado a ningún canal de voz.');
                break;
            case 'shuffle-error':
                embed.setDescription('No hay suficientes canciones en la cola para reordenarla.');
                break;
            case 'already-paused':
                embed.setDescription('La cola de reproducción ya está pausada.');
                break;
            case 'already-resumed':
                embed.setDescription('La cola de reproducción ya está en reproducción.');
                break;
            case 'playlist':
                embed.setDescription('Las listas de reproducción están deshabilitadas.');
                break;
            case 'invalid-position':
                embed.setDescription('La posición que has especificado no es válida.');
                break;
            case 'not-enough-players':
                embed.setDescription('No hay suficientes jugadores para iniciar el torneo.');
                break;
            case 'invalid-id':
                embed.setDescription('El ID que has especificado no es válido.');
                break;
            case 'unknown':
                embed.setDescription('Ha ocurrido un error desconocido.');
                break;
            default:
                embed.setDescription('Ha ocurrido un error desconocido.');
                break;
            }
        return embed;
    } else if (lang === 'en-US') {
        var embed = new EmbedBuilder()
            .setAuthor({ name: 'Something went wrong!', iconURL: 'https://i.imgur.com/hGG9kLU.png' })
            .setTitle('This is what happened:')
            .setThumbnail('https://i.imgur.com/81rFFJy.png')
            .setColor('#5d779d')
            .setFooter({ text: `Requested by ${requester}`})
            .setTimestamp();
        switch (type) {
            case 'no-perms':
                embed.setDescription('You don\'t have permissions to execute this command.');
                break;
            case 'profile-not-found':
                embed.setDescription('The summoner you are looking for doesn\'t exist.');
                break;
            case 'champ-not-found':
                embed.setDescription('The champion you specified was not found.');
                break;
            case 'build-not-found':
                embed.setDescription('The build for the champion in the lane you requested was not found.');
                break;
            case 'runes-not-found':
                embed.setDescription('The runes for the champion in the lane you requested were not found.');
                break;
            case 'no-linked-account':
                embed.setDescription('You don\'t have any League of Legends account linked to your Discord profile.');
                break;
            case 'no-linked-member':
                embed.setDescription('The user you mentioned doesn\'t have any League of Legends account linked to their Discord profile.');
                break;
            case 'link-timeout':
                embed.setDescription('The time to link your League of Legends account has expired. Try again.');
                break;
            case 'link-failed':
                embed.setDescription('You haven\'t changed your League of Legends profile icon to the image I sent you. Try again.');
                break
            case 'not-in-game':
                embed.setDescription('This summoner is not currently in a game.');
                break;
            case 'no-mastery':
                embed.setDescription('This summoner doesn\'t have any mastery points.');
                break;
            case 'no-voice-channel':
                embed.setDescription('You must be in a voice channel to execute this command.');
                break;
            case 'no-connection':
                embed.setDescription('I\'m not connected to any voice channel.');
                break;
            case 'shuffle-error':
                embed.setDescription('There aren\'t enough songs in the queue to shuffle it.');
                break;
            case 'already-paused':
                embed.setDescription('The queue is already paused.');
                break;
            case 'already-resumed':
                embed.setDescription('The queue is already playing.');
                break;
            case 'playlist':
                embed.setDescription('Playlists are disabled.');
                break;
            case 'invalid-position':
                embed.setDescription('The position you specified is not valid.');
                break;
            case 'not-enough-players':
                embed.setDescription('There aren\'t enough players to start the tournament.');
                break;
            case 'invalid-id':
                embed.setDescription('The ID you specified is not valid.');
                break;
            case 'unknown':
                embed.setDescription('An unknown error has occurred.');
                break;
            default:
                embed.setDescription('An unknown error has occurred.');
                break;
            }
            
        return embed;
    }
}

module.exports = error;