const Summoner = require('./summoner_data');
const Region = require('./region');

class Account {
    constructor () {
        this.discord_id = null;
        this.region = new Region();
        this.summoner = new Summoner();
    }
}

module.exports = Account;
