const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

const client = new Client({ intents: 899 });

const event_path = join(__dirname, 'src', 'events');
readdirSync(event_path)
    .filter(file => file.endsWith('.js'))
    .map(file => {
        const event = require(join(event_path, file));
        client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
    });

client.cmds = new Collection();

const cmd_path = join(__dirname, 'src', 'cmds');
readdirSync(cmd_path)
    .filter(file => file.endsWith('.js'))
    .map(file => {
        const cmd = require(join(cmd_path, file));
        client.cmds.set(cmd.data.name, cmd);
    });

client.login(process.env.BOT_Secret);