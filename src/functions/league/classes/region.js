class Region {
    constructor() {
        this.route = null;
        this.name = null;
        this.id = null;
    }

    get_region (id) {
        switch (id) {
            case 'euw1':
                this.route = 'europe';
                this.name = 'EUW';
                this.id = 'euw1';
                break;
            case 'eun1':
                this.route = 'europe';
                this.name = 'EUNE';
                this.id = 'eun1';
                break;
            case 'na1':
                this.route = 'americas';
                this.name = 'NA';
                this.id = 'na1';
                break;
            case 'br1':
                this.route = 'americas';
                this.name = 'BR';
                this.id = 'br1';
                break;
            case 'la1':
                this.route = 'americas';
                this.name = 'LAN';
                this.id = 'la1';
                break;
            case 'la2':
                this.route = 'americas';
                this.name = 'LAS';
                this.id = 'la2';
                break;
            case 'oc1':
                this.route = 'sea';
                this.name = 'OCE';
                this.id = 'oc1';
                break;
            case 'tr1':
                this.route = 'europe';
                this.name = 'TR';
                this.id = 'tr1';
                break;
            case 'ru':
                this.route = 'europe';
                this.name = 'RU';
                this.id = 'ru';
                break;
            case 'jp1':
                this.route = 'asia';
                this.name = 'JP';
                this.id = 'jp1';
                break;
            case 'kr':
                this.route = 'asia';
                this.name = 'KR';
                this.id = 'kr';
                break;
            default:
                break;
        }
        return this;
    }
}

module.exports = Region;