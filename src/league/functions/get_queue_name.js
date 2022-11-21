const axios = require('axios');

function get_queue_name(id) {
    var endpoint = `https://static.developer.riotgames.com/docs/lol/queues.json`
    
    return axios.get(endpoint).then(response => {
        var queues = Object.values(response.data);
        var queue = queues.find(queue => queue.queueId == id);
        if (queue.description.includes('ARAM')) return 'ARAM';
        if (queue.description.includes('URF')) return 'URF';
        if (queue.description.includes('One for All')) return 'One for All';
        if (queue.description.includes('Ranked Solo')) return 'Ranked (Solo/Dúo)';
        if (queue.description.includes('Ranked Flex')) return 'Ranked (Flexible)';
        if (queue.description.includes('Draft')) return 'Normal (Reclutamiento)';
        if (queue.description.includes('Blind')) return 'Normal (A ciegas)';
        if (queue.description.includes('Tutorial')) return 'Tutorial';
        if (queue.description.includes('Co-op vs. AI')) return 'Co-op vs. AI';
        if (queue.description.includes('Clash')) return 'Clash';
        if (queue.description.includes('Nexus Blitz')) return 'Nexus Blitz';
    });
}
module.exports = get_queue_name;