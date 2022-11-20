const { EmbedBuilder } = require('discord.js');

function create_embed(type, options) {
	const embed = new EmbedBuilder();

	if (type === 'play') {
		embed.setAuthor({ name: '🎵 Ahora suena:' });
		embed.setTitle(options.title);
		embed.setURL(options.url);
		var queue = options.queue;
		if (queue.songs.length == 0) {
			embed.setDescription('No hay más canciones en la cola.');
		} else if (queue.songs.length == 1) {
			embed.setDescription('Queda una canción en la cola.');
		} else {
			embed.setDescription(`Quedan ${queue.songs.length} canciones en la cola.`);
		}
	} else if (type === 'firstplay') {
		embed.setAuthor({ name: '🎵 Ahora suena:' });
		embed.setTitle(options.title);
		embed.setURL(options.url);
		embed.setDescription('No hay más canciones en la cola.');
	} else if (type === 'queue') {
		embed.setAuthor({ name: '🎵 Cola de reproducción:' });
		var queue = options.queue;
		embed.setDescription(`**Ahora suena:**\n[${queue.current.title}](${queue.current.url})`);
		if (queue.songs.length == 0) {
			embed.addFields({ name: 'No hay más canciones en la cola.', value: 'Añade canciones con /play (canción)' });
		} else {
			for (let i = 0; i < queue.songs.length; i++) {
				if (i > 14) break;
				var song = queue.songs[i];
				embed.addFields({ name: `${i + 1}. ${song.title}`, value: `Solicitada por: ${song.requester}` });
			}
		}
	} else if (type === 'add_q') {
		embed.setAuthor({ name: '🎵 Se ha añadido a la cola:' });
		embed.setTitle(options.title);
		embed.setURL(options.url);
		var queue = options.queue;
		if (queue.songs.length == 1) {
			embed.setDescription('Hay una canción en la cola.');
		} else {
			embed.setDescription(`Hay ${queue.songs.length} canciones en la cola.`);
		}
	} else if (type === 'shuffle') {
		embed.setAuthor({ name: '🎵 Se ha reordenado la cola de reproducción.' });
		embed.setTitle('¡Utiliza /queue para ver la nueva cola!');
		embed.setDescription(`Ahora mismo hay ${options.queue.songs.length} canciones en la cola.`);
	} else if (type === 'skip') {
		embed.setAuthor({ name: '🎵 Se ha saltado la canción.' });
		if (options.queue.songs.length == 0) {
			embed.setTitle('No hay más canciones en la cola.');
			embed.setDescription('Reproduce música con /play (canción)');
		} else {
			embed.setTitle(`Reproduciendo la siguiente canción`)
			embed.setDescription(`Añade canciones a la cola con /play (canción)`);
		}
	} else if (type === 'pause') {
		embed.setAuthor({ name: '🎵 Se ha pausado la reproducción.' });
		embed.setTitle(`Usa /resume para reanudar la reproducción.`);
	} else if (type === 'resume') {
		embed.setAuthor({ name: '🎵 Se ha reanudado la reproducción.' });
		embed.setTitle(`Usa /play (canción) para añadir canciones a la cola.`);
	} else if (type === 'stop') {
		embed.setAuthor({ name: '🎵 Se ha detenido la reproducción.' });
		embed.setTitle(`Reproduce música con /play (canción)`);
	} else if (type === 'remove') {
		embed.setAuthor({ name: '🎵 Se ha eliminado de la cola:' });
		var song = options.song[0];
		embed.setTitle(song.title);
		embed.setURL(song.url);
		var queue = options.queue;
		if (queue.songs.length == 0) {
			embed.setDescription('No hay más canciones en la cola.');
		} else if (queue.songs.length == 1) {
			embed.setDescription('Queda una canción en la cola.');
		} else {
			embed.setDescription(`Quedan ${queue.songs.length} canciones en la cola.`);
		}
	} else if (type === 'clear') {
		embed.setAuthor({ name: '🎵 Se ha eliminado la cola de reproducción.' });
		embed.setTitle(`Reproduce música con /play (canción)`);
	} else if (type === 'loop') {
		embed.setAuthor({ name: '🎵 Se ha cambiado el modo de bucle.' });
		if (options.queue.loop == true) {
			embed.setTitle(`El modo de bucle está activado.`);
		} else {
			embed.setTitle(`El modo de bucle está desactivado.`);
		}
		embed.setDescription(`Usa /loop para activar o desactivar el modo de bucle.`);
	}
	
	embed.setFooter({ text: `Solicitado por ${options.requester}` });
	embed.setColor('#5d779d');
	embed.setTimestamp();
	return embed;
}

module.exports = create_embed;