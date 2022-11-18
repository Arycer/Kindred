const { get_title } = require('../fetch/get_info');
const Song = require('./song.js');

class Queue {
    constructor() {
        this.playing = false;
        this.loop = false;
        this.songs = [];
        this.current = {
            requester: null,
            title: null,
            url: null
        }
    }

    async add_song(url, requester) {
        var song = new Song(url, await get_title(url), requester);
        this.songs.push(song);
    }

    next() {
        var next = this.songs.shift();
        this.current.requester = next.requester;
        this.current.title = next.title;
        this.current.url = next.url;
    }

    get_current() {
        return this.current;
    }

    shuffle() {
        var currentIndex = this.songs.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.songs[currentIndex];
            this.songs[currentIndex] = this.songs[randomIndex];
            this.songs[randomIndex] = temporaryValue;
        }

        return this.songs;
    }

    remove(index) {
        if (index < 0 || index > this.songs.length) return;
        return this.songs.splice(index, 1)[0];
    }

    looped() {
        return this.loop;
    }

    empty() {
        this.songs = [];
    }

    clear() {
        this.playing = false;
        this.loop = false;
        this.songs = [];
        this.current = {
            requester: null,
            title: null,
            url: null
        }
    }
}

module.exports = Queue;
