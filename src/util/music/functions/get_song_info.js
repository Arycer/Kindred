const youtube_regex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;
const { getBasicInfo } = require('ytdl-core');
const play = require('play-dl');

async function get_title(url) {
    var info = await getBasicInfo(url);
    var title = info.videoDetails.title;
    return title;
}

async function get_url(query) {
    if (youtube_regex.test(query)) {
        return query;
    } else {
        var info = await play.search(query, { limit: 1 });
        var url = info[0].url;
        return url;
    }
}

module.exports = {
    get_title,
    get_url
}