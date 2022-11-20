const create_resource = require('../create/create_resource');
const create_embed = require('../create/create_embed');
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
			const embed = create_embed('play', {
				requester: requester,
				title: title,
				url: url,
				queue: queue
			});
			channel.send({ embeds: [embed] });
		}
    } catch (error) {
        console.error(error);
    }
}

module.exports = play;
