const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join }= require('node:path');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions	
	]
});

client.commands = new Collection();

const cmd_dir = join(__dirname, 'src', 'commands');
const cmd_files = readdirSync(cmd_dir)
	.filter(file => file.endsWith('.js'));

for (const file of cmd_files) {
	const cmd_file = join(cmd_dir, file);
	const cmd = require(cmd_file);
	client.commands.set(cmd.data.name, cmd);
}

const event_path = join(__dirname, 'src', 'events');
const event_files = readdirSync(event_path)
	.filter(file => file.endsWith('.js'));

for (const file of event_files) {
	const event_file = join(event_path, file);
	const event = require(event_file);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

client.login(process.env.DISCORD_TOKEN);

