const create_resource = require('./create_resource');
const { EmbedBuilder } = require('discord.js');

async function play (channel, player, queue, nosend) {
    try {
		var current = queue.get_current();
		var requester = current.requester;
		var title = current.title;
		var url = current.url;
		do {
			var resource = await create_resource(url);
			if (!resource) {
				queue.next();
				current = queue.get_current();
				requester = current.requester;
				title = current.title;
				url = current.url;
			}
		} while (!resource);
		player.play(resource);
		if (!nosend) {
			const embed = new EmbedBuilder();
			embed.setAuthor({ name: '🎵 Ahora suena:' });
			embed.setTitle(title);
			embed.setURL(url);
			if (queue.songs.length == 0) {
				embed.setDescription('No hay más canciones en la cola.');
			} else if (queue.songs.length == 1) {
				embed.setDescription('Queda una canción en la cola.');
			} else {
				embed.setDescription(`Quedan ${queue.songs.length} canciones en la cola.`);
			}
			embed.setFooter({ text: `Solicitado por ${options.requester}` });
			embed.setTimestamp();
			channel.send({ embeds: [embed] });
		}
    } catch (error) {
        console.error(error);
    }
}

module.exports = play;
