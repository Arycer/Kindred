const ytfps = require('ytfps');

async function playlist_fetch (url) {
    const playlist_id = url.split('list=')[1];
    const playlist = await ytfps(playlist_id);
    const videos = playlist.videos.map(video => video.url);
    const urls = [];
    for (const video of videos) {
        urls.push(video);
    }
    return urls;
}

module.exports = playlist_fetch;