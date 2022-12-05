
async function execute(interaction) {
    var username = interaction.options.getString('jugador') || interaction.options.getString('player');
    var region = interaction.options.getString('region') || interaction.options.getString('región');
    var mención = interaction.options.getUser('mención') || interaction.options.getUser('mention');

    if (!username || !region) {
        if (mención) {
            var acc = db.get(mención.id);
            if (!acc) return interaction.followUp({ embeds: [error('es-ES', 'no-linked-member', interaction.user.tag)] });
            var puuid = acc.summoner.identifiers.puuid;
            region = acc.region.id;
        } else {
            var acc = db.get(interaction.user.id);
            if (!acc) return interaction.followUp({ embeds: [error('es-ES', 'no-linked-account', interaction.user.tag)] });
            var puuid = acc.summoner.identifiers.puuid;
            region = acc.region.id;
        }
    }

    var region = new Region().get_region(region);

    var summoner = new Summoner();
    await summoner.get_summoner(region, puuid ? puuid : username);

    if (!summoner.name) return interaction.followUp({ embeds: [error('es-ES', 'profile-not-found', interaction.user.tag)] });

    var livegame = new LiveGame();
    await livegame.get_livegame(region, summoner.identifiers.s_id);

    if (!livegame.ingame) return interaction.followUp({ embeds: [error('es-ES', 'not-in-game', interaction.user.tag)] });

    var embed = new EmbedBuilder()
        .setAuthor({ name: `Partida en vivo de ${summoner.name}`, iconURL: summoner.icon.url })
        .setTitle(`${await get_map_name(livegame.map, 'es-ES')} - ${await get_queue_name(livegame.queue, 'es-ES')}`)
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

module.exports = execute;