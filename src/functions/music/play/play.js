const create_resource = require('../create/create_resource');
const create_embed = require('../create/create_embed');
async function play (channel, player, queue, nosend) {
    try {
		const current = queue.get_current();
		const requester = current.requester;
		const title = current.title;
		const url = current.url;
		const resource = await create_resource(url);
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
