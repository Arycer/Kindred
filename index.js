const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

const client = new Client({ intents: 899 });

const event_path = join(__dirname, 'src', 'events');
const event_files = readdirSync(event_path)
    .filter(file => file.endsWith('.js'));

event_files.forEach(file => {
    const event = require(join(event_path, file));
    client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
});

client.commands = new Collection();

const cmd_path = join(__dirname, 'src', 'cmds');
const cmd_files = readdirSync(cmd_path)
    .filter(file => file.endsWith('.js'));

cmd_files.forEach(file => {
    const command = require(join(cmd_path, file));
    client.commands.set(command.data.name, command);
});

client.login(process.env.BOT_Secret);