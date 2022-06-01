var { MessageEmbed } = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
var emoji = require(`../../botconfig/emojis.json`);
var radios = require(`../../botconfig/radiostations.json`);
var playermanager = require(`../../handlers/playermanager`);
var { stations, dbEnsure } = require(`../../handlers/functions`);
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
    name: "setup-music",
    category: "💪 Setup",
    aliases: ["setupmusic"],
    cooldown: 10,
    usage: "setup-music #Channel",
    description: "Setup a Music Request Channel",
    memberpermissions: ["ADMINISTRATOR"],
    type: "fun",
    run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
      try{
        //I AM NOW MAKING A MUSIC REQUEST SYSTEM FOR A BOT!
        await dbEnsure(client.musicsettings, message.guild.id, {
          "channel": "",
          "message": "",
          "text": true
        })
        //first declare all embeds
        var Emojis = [
          "0️⃣",
          "1️⃣",
          "2️⃣",
          "3️⃣",
          "4️⃣",
          "5️⃣",
          "6️⃣",
          "7️⃣",
          "8️⃣",
          "9️⃣",
          "🔟",
          "🟥",
          "🟧",
          "🟨",
          "🟩",
          "🟦",
          "🟪",
          "🟫",
        ]
        var embeds = [
          new MessageEmbed()
            .setColor(es.color)
            .setTitle(`📃 Queue of __${message.guild.name}__`)
            .setDescription(`**Currently there are __0 Songs__ in the Queue**`)
            .setThumbnail(message.guild.iconURL({dynamic: true})),
          new MessageEmbed()
            .setColor(es.color)
            .setFooter(client.getFooter(es))
            .setImage(message.guild.banner ? message.guild.bannerURL({size: 4096}) : "https://cdn.discordapp.com/attachments/968349976331694100/979686974338244628/Neon_Text_Effect.png")
            .setTitle(`Start Listening to Music, by connecting to a Voice Channel and sending either the **SONG LINK** or **SONG NAME** in this Channel!`)
            .setDescription(`> *I support Youtube, Spotify, Soundcloud and direct MP3 Links!*`)
        ]
        //now we add the components!
        var components = [
          new MessageActionRow().addComponents([
            new MessageSelectMenu()
            .setCustomId("MessageSelectMenu")
            .addOptions(["Strange-Fruits", "Gaming", "Chill", "Magic-Release", "MiYaGi playlist", "Default", "Rocky's Spotify Playlist", "Bandit Camp Music Storage"].map((t, index) => {
              return {
                label: t.substr(0, 25),
                value: t.substr(0, 25),
                description: `Load a Music-Playlist: "${t}"`.substr(0, 50),
                emoji: Emojis[index]
              }
            }))
          ]),
            new MessageActionRow().addComponents([
            new MessageButton().setStyle('PRIMARY').setCustomId('Join').setEmoji(`<:join_vc:950885408290508821>`).setLabel(`${client.la[ls].cmds.music.musicsystem.joinbt}`).setDisabled(false),
            new MessageButton().setStyle('PRIMARY').setCustomId('Leave').setEmoji(`<:home:977868613459521589>`).setLabel(`${client.la[ls].cmds.music.musicsystem.leavebt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Text').setEmoji(`<:on:977868613862174730>`).setLabel(`${client.la[ls].cmds.music.musicsystem.textbt2}`).setDisabled(false),
            new MessageButton().setStyle('PRIMARY').setCustomId('Save').setEmoji(`<:save:978918412673753098>`).setLabel(`${client.la[ls].cmds.music.musicsystem.save}`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SECONDARY').setCustomId('Vol-').setEmoji('<:volume:977868613744730153>').setLabel(`${client.la[ls].cmds.music.musicsystem.volmbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Rewind').setEmoji('<:rewind:977868614289989682>').setLabel(`${client.la[ls].cmds.music.musicsystem.rewbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Pause').setEmoji('<:pause:977868613623119883>').setLabel(`${client.la[ls].cmds.music.musicsystem.pausebt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Forward').setEmoji('<:forward:977868614080286821>').setLabel(`${client.la[ls].cmds.music.musicsystem.forbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Vol+').setEmoji('<:low_volume:977868614147395626>').setLabel(`${client.la[ls].cmds.music.musicsystem.volpbt}`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SECONDARY').setCustomId('Lyrics').setEmoji('<:replay:977868614000582656>').setLabel(`${client.la[ls].cmds.music.musicsystem.replbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Song').setEmoji(`<:song_loop:977868613983813684>`).setLabel(`${client.la[ls].cmds.music.musicsystem.slbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Stop').setEmoji(`<:stop:977868613790863381>`).setLabel(`${client.la[ls].cmds.music.musicsystem.stopbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Queue').setEmoji(`<:queue_loop:977868614222880810>`).setLabel(`${client.la[ls].cmds.music.musicsystem.qlbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Skip').setEmoji(`<:skip:977868613631483955>`).setLabel(`${client.la[ls].cmds.music.musicsystem.skipbt}`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SECONDARY').setCustomId('Shuffle').setEmoji('<:shuffle:977868613736333363>').setLabel(`${client.la[ls].cmds.music.musicsystem.shuffbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Volmin').setEmoji('<:volume:977868613744730153>').setLabel(`${client.la[ls].cmds.music.musicsystem.volminbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Volmid').setEmoji('<:low_volume:977868614147395626>').setLabel(`${client.la[ls].cmds.music.musicsystem.midvolbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Volmax').setEmoji('<:max_volume:977868613971230750>').setLabel(`${client.la[ls].cmds.music.musicsystem.volmaxbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Autoplay').setEmoji('<:joines:950878825254883378>').setLabel(`${client.la[ls].cmds.music.musicsystem.autoplbt}`).setDisabled(),
          ]),
        ]
        let channel = message.mentions.channels.first();
        if(!channel) return message.reply(":x: **You forgot to ping a Text-Channel!**")
        //send the data in the channel
        channel.send({embeds, components}).then(async (msg) => {
          await client.musicsettings.set(message.guild.id+".channel", channel.id);
          await client.musicsettings.set(message.guild.id+".message", msg.id);
          await client.musicsettings.set(message.guild.id+".text", true);
          //send a success message
          return message.reply(`✅ **Successfully setupped the Music System in:** <#${channel.id}>`)
        });
        } catch (e) {
            console.log(String(e.stack).grey.bgRed)
            return message.reply({embeds: [new MessageEmbed()
                .setColor(es.wrongcolor)
    						.setFooter(client.getFooter(es))
                .setTitle(client.la[ls].common.erroroccur)
                .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-radio"]["variable9"]))
            ]});
        }
    },
};

