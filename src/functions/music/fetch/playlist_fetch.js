const ytfps = require('ytfps');

async function playlist_fetch (url) {
    const playlist = await ytfps(url);
    const videos = playlist.videos.map(video => video.url);
    const urls = [];
    for (const video of videos) {
        urls.push(video);
    }
    return urls;
}

module.exports = playlist_fetch;