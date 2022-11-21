const embed_profile = require('../functions/create_embed_profile');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const not_found = require('../functions/create_embed_notfound');
const Profile = require('../classes/profile');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolprofile')
        .setDescription('Muestra el perfil de un usuario de League of Legends')
        .addStringOption(option => 
            option.setName('region')
                .setDescription('Región del usuario')
                .setRequired(false)
                .addChoices(
                    { name: 'EUW', value: 'euw1' },
                    { name: 'EUNE', value: 'eun1' },
                    { name: 'NA', value: 'na1' },
                    { name: 'BR', value: 'br1' },
                    { name: 'LAN', value: 'la1' },
                    { name: 'LAS', value: 'la2' },
                    { name: 'OCE', value: 'oc1' },
                    { name: 'TR', value: 'tr1' },
                    { name: 'RU', value: 'ru' },
                    { name: 'JP', value: 'jp1' },
                    { name: 'KR', value: 'kr' },
                ))
            .addStringOption(option => option.setName('usuario').setDescription('Nombre de usuario de League of Legends').setRequired(false))
            .addUserOption(option => option.setName('mención').setDescription('Usuario de Discord').setRequired(false)),
    async execute(interaction) {
        try {
            var username = interaction.options.getString('usuario');
            var region = interaction.options.getString('region');
            var mención = interaction.options.getUser('mención');

            if (!username || !region) {
                if (mención) {
                    var acc = get_from_db(interaction, mención);
                    if (acc) {
                        username = acc.summoner.name;
                        region = acc.region.id;
                    } else {
                        var embed = new EmbedBuilder()
                            .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1044021176177012798/939.jpg' })
                            .setTitle('Esto es lo que ha pasado:')
                            .setDescription('El usuario no tiene ninguna cuenta enlazada')
                            .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1044017562775719967/unknown.png')
                            .setColor('#5d779d')
                            .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                            .setTimestamp();
                        return await interaction.followUp({ embeds: [embed] });
                    }
                } else {
                    var acc = get_from_db(interaction, interaction.user);
                    if (acc) {
                        username = acc.summoner.name;
                        region = acc.region.id;
                    } else {
                        var embed = new EmbedBuilder()
                            .setAuthor({ name: '¡Algo ha salido mal!', iconURL: 'https://media.discordapp.net/attachments/1040519867578728481/1044021176177012798/939.jpg' })
                            .setTitle('Esto es lo que ha pasado:')
                            .setDescription('No has especificado ningún usuario y no tienes ninguna cuenta enlazada')
                            .setThumbnail('https://cdn.discordapp.com/attachments/1040519867578728481/1044017562775719967/unknown.png')
                            .setColor('#5d779d')
                            .setFooter({ text: `Solicitado por ${interaction.user.username}`})
                            .setTimestamp();
                        return await interaction.followUp({ embeds: [embed] });
                    }
                }
            }

            const profile = new Profile();
            profile.init(region, username, interaction).then(async () => {
                if (profile.summoner_data.summoner_id) {
                    const embed = await embed_profile(profile, interaction);
                    await interaction.followUp({ embeds: [embed] });
                } else {
                    const embed = not_found(username, interaction);
                    await interaction.followUp({ embeds: [embed] });
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
};

function get_from_db (interaction, user) {
    var database = interaction.client.database;
    var acc = database.get(user.id);

    if (acc) {
        return acc;
    } else {
        return false;
    }
}