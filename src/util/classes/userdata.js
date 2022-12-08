class Userdata {
    constructor () {
        this.language = 'es-ES';
        this.league = {
            region: null,
            puuid : null,
        }
    }

    set_league (region, puuid) {
        this.league.region = region;
        this.league.puuid = puuid;
    }
}

module.exports = Userdata;
