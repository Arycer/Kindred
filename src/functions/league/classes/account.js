const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const Summoner = require('./summoner_data');
const Region = require('./region');

class Account {
    constructor () {
        this.discord_id = null;
        this.region = new Region();
        this.summoner = new Summoner();
    }

    async link (interaction, region, name) {
        this.region.get_region(region);

        var summoner = await this.summoner.get_summoner(this.region, name);

        if (!summoner.summoner_id) {
            return interaction.reply({ content: 'No se ha encontrado el invocador.', ephemeral: true });
        }

        do {
            var random = Math.floor(Math.random() * 21);
        } while (summoner.icon_id == random);

        var requiered_icon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${random}.jpg`;

        var embed = new EmbedBuilder()
            .setColor('#5d779d')
            .setAuthor({ name: `${this.region.name} - ${this.summoner.name}`, iconURL: summoner.profile_icon })
            .setTitle('Esto es lo que debes hacer:')
            .setDescription(`Para verificar que eres tú, por favor, cambia tu icono de perfil a este, y pusa el botón a coninuación. Tienes un minuto para esto, o la verificación fallará` )
            .setThumbnail(requiered_icon)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
            .setTimestamp();

        var row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('¡Ya lo he hecho!')
                    .setStyle(ButtonStyle.Primary)
            );

        var msg = await interaction.channel.send({ embeds: [embed], components: [row] });

        var collector = new InteractionCollector(interaction.client, { time: 60000, max: 1, filter: i => i.customId === 'verify' && i.user.id === interaction.user.id });

        collector.on('collect', async () => {
            summoner = await this.summoner.get_summoner(this.region, name);

            if (summoner.icon_id == random) {
                this.discord_id = interaction.user.id;
                this.summoner = summoner;

                var database = interaction.client.database;
                database.create(interaction.user.id, this)

                var embed = new EmbedBuilder()
                    .setColor('#5d779d')
                    .setAuthor({ name: `${this.region.name} - ${this.summoner.name}`, iconURL: summoner.profile_icon })
                    .setTitle('¡Todo listo!')
                    .setDescription(`Tu cuenta ha sido vinculada correctamente.` )
                    .setThumbnail(`https://media.discordapp.net/attachments/1040519867578728481/1044017541594501220/unknown.png`)
                    .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                    .setTimestamp();

                await interaction.followUp({ embeds: [embed] });
                await msg.delete();
            } else {
                var embed = new EmbedBuilder()
                    .setColor('#5d779d')
                    .setAuthor({ name: `${this.region.name} - ${this.summoner.name}`, iconURL: summoner.profile_icon })
                    .setTitle('¡Algo salió mal!')
                    .setDescription(`No has cambiado tu icono de perfil a la imagen que te pedí.` )
                    .setThumbnail(`https://media.discordapp.net/attachments/1040519867578728481/1044017562775719967/unknown.png`)
                    .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                    .setTimestamp();

                await interaction.followUp({ embeds: [embed] });
                await msg.delete();
            }
        });

        collector.on('end', async collected => {
            if (collected.size == 0) {
                var embed = new EmbedBuilder()
                    .setColor('#5d779d')
                    .setAuthor({ name: `${this.region.name} - ${this.summoner.name}`, iconURL: summoner.profile_icon })
                    .setTitle('¡Algo salió mal!')
                    .setDescription(`Has excedido el límite de tiempo para completar la verificación`)
                    .setThumbnail(`https://media.discordapp.net/attachments/1040519867578728481/1044017562775719967/unknown.png`)
                    .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                    .setTimestamp();

                await interaction.followUp({ embeds: [embed] });
                await msg.delete();
            }
        });
    }
}

module.exports = Account;