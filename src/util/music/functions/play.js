async function play (lang, channel, player, queue, nosend) {
	var run = require(`./${lang}/play`)(channel, player, queue, nosend);
	return await run;
}

module.exports = play;
