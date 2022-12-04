const { EmbedBuilder } = require('discord.js');

async function run (interaction) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Lista de comandos', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1046022952547786842/939.jpg'})
        .setDescription(`¡Hola! Soy Kindred, un bot de Discord destinado a League of Legends. Estos son los comandos que puedes usar:`)
        .setColor('#5d779d')
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
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
                { name: '/kindred [módulo]', value: 'Muestra la lista de comandos de un módulo.' },
                { name: '/language [idioma]', value: 'Cambia el idioma del bot.' }
                );
            }
            embed.addFields(
            { name: '¡Añade a Kindred a tu servidor!', value: '[🔗 Link](https://bit.ly/3F4vQ9v)', inline: true },
            { name: 'Servidor de soporte', value: '[🔗 Link](https://discord.gg/Bhc3PCfjbH)', inline: true }
            );

        await interaction.followUp({ embeds: [embed] });
}

module.exports = run;