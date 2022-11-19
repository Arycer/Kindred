const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join }= require('node:path');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates
	] 
});

client.commands = new Collection();

const commands_path = join(__dirname, 'src', 'commands');
const command_files = readdirSync(commands_path).filter(file => file.endsWith('.js'));

for (const file of command_files) {
	const command_file = join(commands_path, file);
	const command = require(command_file);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`El comando /${command_file} no es válido.`);
	}
}

const events_path = join(__dirname, 'src', 'events');
const event_files = readdirSync(events_path).filter(file => file.endsWith('.js'));

for (const file of event_files) {
	const event_file = join(events_path, file);
	const event = require(event_file);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

client.login(process.env.DISCORD_TOKEN);

