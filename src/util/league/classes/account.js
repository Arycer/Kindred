const Summoner = require('./summoner');
const Region = require('./region');

class Account {
    constructor () {
        this.discord_id = null;
        this.region = new Region();
        this.summoner = new Summoner();
    }
}

module.exports = Account;
