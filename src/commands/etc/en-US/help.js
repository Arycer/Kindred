const { EmbedBuilder } = require('discord.js');

async function run (interaction) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Command list', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1046022952547786842/939.jpg'})
        .setDescription(`Hi! I'm Kindred, a Discord bot dedicated to League of Legends. These are the commands you can use:`)
        .setColor('#5d779d')
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

        if (interaction.options.getString('módulo') === 'music' || interaction.options.getString('module') === 'music') {
        var music_path = join(__dirname, '..', '..', 'music');
        var music_files = fs.readdirSync(music_path)
            .filter(file => file.endsWith('.js'));
        for (const file of music_files) {
            const command = require(join(music_path, file));
            embed.addFields({ name: `/music ${command.data.name}`, value: command.data.description });
        }

        } else if (interaction.options.getString('módulo') === 'league' || interaction.options.getString('module') === 'league') {
            var league_path = join(__dirname, '..', '..', 'lol');
            var league_files = fs.readdirSync(league_path)
                .filter(file => file.endsWith('.js'));
            for (const file of league_files) {
                const command = require(join(league_path, file));
                embed.addFields({ name: `/league ${command.data.name}`, value: command.data.description });
            }
        } else if (!interaction.options.getString('módulo') && !interaction.options.getString('module')) {
            embed.addFields(
                { name: '/kindred [module]', value: 'Shows the list of commands of a module.' },
                { name: '/language [language]', value: 'Changes the language of the bot.' }
                );
            }
            embed.addFields(
            { name: 'Add Kindred to your server!', value: '[🔗 Link](https://bit.ly/3F4vQ9v)', inline: true },
            { name: 'Support server', value: '[🔗 Link](https://discord.gg/Bhc3PCfjbH)', inline: true }
            );

        await interaction.followUp({ embeds: [embed] });
}

module.exports = run;