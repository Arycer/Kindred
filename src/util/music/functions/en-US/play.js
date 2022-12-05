const create_resource = require('../create_resource');
const { EmbedBuilder } = require('discord.js');

async function run (channel, player, queue, nosend) {
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
        var embed = new EmbedBuilder()
            .setAuthor({ name: '🎵 Now playing' })
            .setTitle(title)
            .setURL(url)
            .setFooter({ text: `Requested by ${requester}` })
            .setColor('#5d779d')
            .setTimestamp();
        if (queue.songs.length == 1) {
            embed.setDescription('There is one more song in the queue');
        } else {
            embed.setDescription(`There are ${queue.songs.length} more songs in the queue`);
        }
		channel.send({ embeds: [embed] });
	}
}

module.exports = run;