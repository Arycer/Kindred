const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const Summoner = require('../../league/classes/summoner_data');
const LiveGame = require('../../league/classes/livegame');
const Region = require('../../league/classes/region');
const error = require('../../league/functions/error');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('livegame')
        .setDescription('Muestra la partida en vivo de un jugador de League of Legends')
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
        var username = interaction.options.getString('usuario');
        var region = interaction.options.getString('region');
        var mención = interaction.options.getUser('mención');

        if (!username || !region) {
            if (mención) {
                var acc = db.get(mención.id);
                if (!acc) return interaction.followUp({ embeds: [error('El usuario no tiene ninguna cuenta enlazada.', interaction.user.tag)] });
                var puuid = acc.summoner.identifiers.puuid;
                region = acc.region.id;
            } else {
                var acc = db.get(interaction.user.id);
                if (!acc) return interaction.followUp({ embeds: [error('No tienes ninguna cuenta enlazada.', interaction.user.tag)] });
                var puuid = acc.summoner.identifiers.puuid;
                region = acc.region.id;
            }
        }

        var region = new Region().get_region(region);

        var summoner = new Summoner();
        await summoner.get_summoner(region, puuid ? puuid : username);

        if (!summoner.name) return interaction.followUp({ embeds: [error('El usuario no existe. Comprueba que has escrito bien el nombre de usuario y la región', interaction.user.tag)] });

        var livegame = new LiveGame();
        await livegame.get_livegame(region, summoner.identifiers.s_id);

        if (!livegame.ingame) return interaction.followUp({ embeds: [error('El usuario no está en partida.', interaction.user.tag)] });

        var embed = new EmbedBuilder()
            .setAuthor({ name: `Partida en vivo de ${summoner.name}`, iconURL: summoner.icon.url })
            .setTitle(`${livegame.map.name} - ${livegame.queue.name}`)
            .setFooter({ text: `Solicitado por ${interaction.user.username}`})
            .setColor('#5d779d')
            .setTimestamp();

        for (var i = 0; i < livegame.participants.blue.length; i++) {
            var p = livegame.participants.blue[i];
            if (p.ranked.solo.tier) {
                var r_text = `Solo/Dúo: ${p.ranked.solo.emote} ${p.ranked.solo.tier} ${p.ranked.solo.rank} ${p.ranked.solo.lps} LP - `;
                r_text += `${p.ranked.solo.wins}W ${p.ranked.solo.losses}L (${p.ranked.solo.winrate}% WR)`;
            } else if (p.ranked.flex.tier) {
                var r_text = `Flexible: ${p.ranked.flex.emote} ${p.ranked.flex.tier} ${p.ranked.flex.rank} ${p.ranked.flex.lps} LP - `;
                r_text += `${p.ranked.flex.wins}W ${p.ranked.flex.losses}L (${p.ranked.flex.winrate}% WR)`;
            } else {
                var r_text = 'Sin clasificar.';
            }

            embed.addFields({
                name: `🔵 ${i + 1}. ${p.summoner_data.name} - ${p.champion.emote} ${p.champion.name} - ${p.spells.spell1.emote}${p.spells.spell2.emote} ${p.runes.primary.emote} ${p.runes.secondary.emote}`,
                value: `${r_text}`,
                inline: false
            });
        }

        for (var i = 0; i < livegame.participants.red.length; i++) {
            var p = livegame.participants.red[i];
            if (p.ranked.solo.tier) {
                var r_text = `Solo/Dúo: ${p.ranked.solo.emote} ${p.ranked.solo.tier} ${p.ranked.solo.rank} ${p.ranked.solo.lps} LP - `;
                r_text += `${p.ranked.solo.wins}W ${p.ranked.solo.losses}L (${p.ranked.solo.winrate}% WR)`;
            } else if (p.ranked.flex.tier) {
                var r_text = `Flexible: ${p.ranked.flex.emote} ${p.ranked.flex.tier} ${p.ranked.flex.rank} ${p.ranked.flex.lps} LP - `;
                r_text += `${p.ranked.flex.wins}W ${p.ranked.flex.losses}L (${p.ranked.flex.winrate}% WR)`;
            } else {
                var r_text = 'Sin clasificar.';
            }

            embed.addFields({
                name: `🔴 ${i + 1}. ${p.summoner_data.name} - ${p.champion.emote} ${p.champion.name} - ${p.spells.spell1.emote}${p.spells.spell2.emote} ${p.runes.primary.emote} ${p.runes.secondary.emote}`,
                value: `${r_text}`,
                inline: false
            });
        }
        return await interaction.followUp({ embeds: [embed] });
    }
}