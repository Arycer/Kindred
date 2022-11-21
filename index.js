const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join }= require('node:path');
const MeowdB = require('meowdb');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions	
	]
});

client.database = new MeowdB({
	dir: `${__dirname}/src/database`,
	name: 'database',
});

client.commands = new Collection();

const league_cmds_dir = join(__dirname, 'src', 'league', 'commands');
const music_cmds_dir = join(__dirname, 'src', 'music', 'commands');

const league_cmds_files = readdirSync(league_cmds_dir).filter(file => file.endsWith('.js'));
const music_cmds_files = readdirSync(music_cmds_dir).filter(file => file.endsWith('.js'));

for (const file of league_cmds_files) {
	const cmd_file = join(league_cmds_dir, file);
	const cmd = require(cmd_file);
	client.commands.set(cmd.data.name, cmd);
}

for (const file of music_cmds_files) {
	const cmd_file = join(music_cmds_dir, file);
	const cmd = require(cmd_file);
	client.commands.set(cmd.data.name, cmd);
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

