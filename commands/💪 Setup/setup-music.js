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
    usage: "setup-music",
    description: "Setup a Music Request Channel",
    memberpermissions: ["ADMINISTRATOR"],
    type: "system",
    run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
      try{
        //I AM NOW MAKING A MUSIC REQUEST SYSTEM FOR A BOT!
        await dbEnsure(client.musicsettings, message.guild.id, {
          "channel": "",
          "message": "",
          "banner": "https://cdn.discordapp.com/attachments/968349976331694100/979686974338244628/Neon_Text_Effect.png",
          "text": true
        })
        let settings = await client.settings.get(message.guild.id)
        let es = settings.embed;
        let ls = settings.language;
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
          .setTitle(client.la[ls].cmds.music.musicsystem.qof+`__${message.guild.name}__`)
          .setDescription(client.la[ls].cmds.music.musicsystem.osongs)
          .setThumbnail(guild.iconURL({
            dynamic: true
          })),
          new MessageEmbed()
          .setColor(es.color)
          .setFooter(client.getFooter(es))
          .setImage(await client.musicsettings.get(message.guild.id+".banner"))
          .setTitle(client.la[ls].cmds.music.musicsystem.title)
          .setDescription(client.la[ls].cmds.music.musicsystem.subtitle)
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
              new MessageButton().setStyle('PRIMARY').setCustomId('Text').setEmoji(`<:on:977868613862174730>`).setLabel(`${client.la[ls].cmds.music.musicsystem.textbt2}`).setDisabled(false),
              new MessageButton().setStyle('PRIMARY').setCustomId('Leave').setEmoji(`<:home:977868613459521589>`).setLabel(`${client.la[ls].cmds.music.musicsystem.leavebt}`).setDisabled(),
              new MessageButton().setStyle('PRIMARY').setCustomId('Save').setEmoji(`<:save:978918412673753098>`).setLabel(`${client.la[ls].cmds.music.musicsystem.savebt}`).setDisabled(),
              new MessageButton().setStyle('SECONDARY').setCustomId('Autoplay').setEmoji('<:joines:950878825254883378>').setLabel(`${client.la[ls].cmds.music.musicsystem.autoplbt}`).setDisabled()
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SECONDARY').setCustomId('Vol-').setEmoji('<:volume:977868613744730153>').setLabel(`${client.la[ls].cmds.music.musicsystem.volmbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Previous').setEmoji(`<:prev:980838844398194758>`).setLabel(`${client.la[ls].cmds.music.musicsystem.prevbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Pause').setEmoji('<:pause:977868613623119883>').setLabel(`${client.la[ls].cmds.music.musicsystem.pausebt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Skip').setEmoji(`<:skip:977868613631483955>`).setLabel(`${client.la[ls].cmds.music.musicsystem.skipbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Vol+').setEmoji('<:low_volume:977868614147395626>').setLabel(`${client.la[ls].cmds.music.musicsystem.volpbt}`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SECONDARY').setCustomId('Rewind').setEmoji('<:rewind:977868614289989682>').setLabel(`${client.la[ls].cmds.music.musicsystem.rewbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Song').setEmoji(`<:song_loop:977868613983813684>`).setLabel(`${client.la[ls].cmds.music.musicsystem.slbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Stop').setEmoji(`<:stop:977868613790863381>`).setLabel(`${client.la[ls].cmds.music.musicsystem.stopbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Queue').setEmoji(`<:queue_loop:977868614222880810>`).setLabel(`${client.la[ls].cmds.music.musicsystem.qlbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Forward').setEmoji('<:forward:977868614080286821>').setLabel(`${client.la[ls].cmds.music.musicsystem.forbt}`).setDisabled(),
          ]),
          new MessageActionRow().addComponents([
            new MessageButton().setStyle('SECONDARY').setCustomId('Lyrics').setEmoji('<:replay:977868614000582656>').setLabel(`${client.la[ls].cmds.music.musicsystem.replbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Volmin').setEmoji('<:volume:977868613744730153>').setLabel(`${client.la[ls].cmds.music.musicsystem.volminbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Volmid').setEmoji('<:low_volume:977868614147395626>').setLabel(`${client.la[ls].cmds.music.musicsystem.midvolbt}`).setDisabled(),
            new MessageButton().setStyle('PRIMARY').setCustomId('Volmax').setEmoji('<:max_volume:977868613971230750>').setLabel(`${client.la[ls].cmds.music.musicsystem.volmaxbt}`).setDisabled(),
            new MessageButton().setStyle('SECONDARY').setCustomId('Shuffle').setEmoji('<:shuffle:977868613736333363>').setLabel(`${client.la[ls].cmds.music.musicsystem.shuffbt}`).setDisabled(),
          ]),
        ]
        first_layer()
        async function first_layer(){
          let menuoptions = [
            {
              value: client.la[ls].cmds.setup.setupmusic.fvalue,
              description: client.la[ls].cmds.setup.setupmusic.fdescription,
              emoji: "950884027320135711"
            },
            {
              value: client.la[ls].cmds.setup.setupmusic.svalue,
              description: client.la[ls].cmds.setup.setupmusic.sdescription,
              emoji: "🖼"
            },
            {
              value: client.la[ls].cmds.setup.setupmusic.tvalue,
              description: client.la[ls].cmds.setup.setupmusic.tdescription,
              emoji: "🗑"
            },
            {
              value: client.la[ls].cmds.setup.setupmusic.fval,
              description: client.la[ls].cmds.setup.setupmusic.fdesc,
              emoji: "951013282607685632"
            }
          ]
          //define the selection
          let Selection = new MessageSelectMenu()
            .setCustomId('MenuSelection') 
            .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
            .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
            .setPlaceholder(client.la[ls].cmds.setup.setupmusic.click) 
            .addOptions(
            menuoptions.map(option => {
              let Obj = {
                label: option.label ? option.label.substring(0, 50) : option.value.substring(0, 50),
                value: option.value.substring(0, 50),
                description: option.description.substring(0, 50),
              }
            if(option.emoji) Obj.emoji = option.emoji;
            return Obj;
           }))
          
          //define the embed
          let MenuEmbed = new MessageEmbed()
            .setColor(es.color)
            .setAuthor('Music Setup', 'https://images.emojiterra.com/mozilla/512px/1f3b6.png', 'https://dsc.gg/banditcamp')
            .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable2"]))
          //send the menu msg
          let menumsg = await message.reply({embeds: [MenuEmbed], components: [new MessageActionRow().addComponents(Selection)]})
          //Create the collector
          const collector = menumsg.createMessageComponentCollector({ 
            filter: i => i?.isSelectMenu() && i?.message.author.id == client.user.id && i?.user,
            time: 90000
          })
          //Menu Collections
          collector.on('collect', menu => {
            if (menu?.user.id === cmduser.id) {
              collector.stop();
              let menuoptiondata = menuoptions.find(v=>v.value == menu?.values[0])
              if(menu?.values[0] == client.la[ls].cmds.setup.setupmusic.fval) return menu?.reply(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable3"]))
              menu?.deferUpdate();
              let SetupNumber = menu?.values[0].split(" ")[0]
              handle_the_picks(menu?.values[0], SetupNumber, menuoptiondata)
            }
            else menu?.reply({content: `<:no:951013282607685632> ${client.la[ls].cmds.setup.setupmusic.only} <@${cmduser.id}>`, ephemeral: true});
          });
          //Once the Collections ended edit the menu message
          collector.on('end', collected => {
            menumsg.edit({embeds: [menumsg.embeds[0].setDescription(`~~${menumsg.embeds[0].description}~~`)], components: [], content: `${collected && collected.first() && collected.first().values ? `<a:yes:950884027320135711> **${client.la[ls].cmds.setup.setupmusic.selected}: \`${collected ? collected.first().values[0] : client.la[ls].cmds.setup.setupmusic.nothing}\`**` : client.la[ls].cmds.setup.setupmusic.nothings }`})
          });
        }
  
        async function handle_the_picks(optionhandletype, SetupNumber, menuoptiondata) {
          switch (optionhandletype) {
            case client.la[ls].cmds.setup.setupmusic.fvalue: {
              var tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(client.la[ls].cmds.setup.setupmusic.which)
                .setColor(es.color)
                .setDescription(`*${client.la[ls].cmds.setup.setupmusic.ping}*`)
                .setFooter(client.getFooter(es))
              ]})
              await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author.id,
                  max: 1,
                  time: 90000,
                  errors: ["time"]
                })
                .then(collected => {
                  var message = collected.first();
                  var channel = message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first() || message.guild.channels.cache.get(message.content.trim().split(" ")[0]);
                  if (channel) {
                    try {
                      channel.send({embeds, components}).then(msg => {
                      channelsetup(channel, msg);
                    });
                      return message.reply({embeds: [new Discord.MessageEmbed()
                        .setTitle(`<a:yes:950884027320135711> ${client.la[ls].cmds.setup.setupmusic.set} \`${channel.name}\``)
                        .setColor(es.color)
                        .setFooter(client.getFooter(es))
                      ]});
                    } catch (e) {
                      return message.reply({embeds: [new Discord.MessageEmbed()
                        .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-rank"]["variable8"]))
                        .setColor(es.wrongcolor)
                        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-rank"]["variable9"]))
                        .setFooter(client.getFooter(es))
                      ]});
                    }
                  } else {
                    return message.reply(client.la[ls].cmds.setup.setupmusic.nvalid)
                  }
                })
                .catch(e => {
                  console.log(e.stack ? String(e.stack).grey : String(e).grey);
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-rank"]["variable10"]))
                    .setColor(es.wrongcolor)
                    .setDescription(`${client.la[ls].cmds.setup.setupmusic.canceled}`.substring(0, 2000))
                    .setFooter(client.getFooter(es))
                  ]});
                })
            }break;
            case client.la[ls].cmds.setup.setupmusic.svalue: {
              let tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(client.la[ls].cmds.setup.setupmusic.whbanner)
              .setDescription(`*${client.la[ls].cmds.setup.setupmusic.jurl}*`)
              .setColor(es.color)
              .setFooter(client.getFooter(es))
              ]})
              await tempmsg.channel.awaitMessages({
                filter: m => m.author.id == cmduser.id,
                max: 1,
                errors: ["time"],
                time: 90000,
              }).then(async collected => {
                let link = collected.first().content.trim().split(" ");
                if(!link[0].startsWith("https://") || !link[0].endsWith(".png" || ".jpg" || ".gif")) return message.reply(`<:no:951013282607685632> **${client.la[ls].cmds.setup.setupmusic.linkerr}**`)
                try {
                  await client.musicsettings.set(message.guild.id+".banner", link[0]);
                  message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(`<a:yes:950884027320135711> ${client.la[ls].cmds.setup.setupmusic.scbg}`)
                    .setDescription(`*${client.la[ls].cmds.setup.setupmusic.ifno}*`)
                    .setColor(es.color)
                    .setFooter(client.getFooter(es))
                  ]});
                  const musicsettings = await client.musicsettings.get(message.guild.id)
                  if(musicsettings.channel && musicsettings.channel.length > 5){
                    let messageId = musicsettings.message;
                    let guild = await client.guilds.cache.get(message.guild.id)
                    if(guild && messageId) {
                      let channel = guild.channels.cache.get(musicsettings.channel);
                      let message = await channel.messages.fetch(messageId).catch(() => null);
                      if(message) {
                        //edit the message so that it's right!
                        var data = await require(`${process.cwd()}/handlers/erela_events/musicsystem`).generateQueueEmbed(client, message.guild.id)
                        message.edit(data).catch(() => null)
                      }
                    }
                  }
                  return;
                } catch (e) {
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-rank"]["variable13"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-rank"]["variable14"]))
                    .setFooter(client.getFooter(es))
                  ]});
                }
              }).catch(e => {
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-aichat"]["variable8"]))
                  .setColor(es.wrongcolor)
                  .setDescription(`${client.la[ls].cmds.setup.setupmusic.canseled}`.substring(0, 2000))
                  .setFooter(client.getFooter(es))
                ]});
              });

            }
            break;

            case client.la[ls].cmds.setup.setupmusic.tvalue: {
              await client.musicsettings.set(message.guild.id+".banner", "https://cdn.discordapp.com/attachments/968349976331694100/979686974338244628/Neon_Text_Effect.png");
              message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(`<a:yes:950884027320135711> ${client.la[ls].cmds.setup.setupmusic.srcbg}`)
                .setDescription(`*${client.la[ls].cmds.setup.setupmusic.srcbgd}*`)
                .setColor(es.color)
                .setFooter(client.getFooter(es))
              ]});
              const musicsettings = await client.musicsettings.get(message.guild.id)
              if(musicsettings.channel && musicsettings.channel.length > 5){
                let messageId = musicsettings.message;
                let guild = await client.guilds.cache.get(message.guild.id)
                if(guild && messageId) {
                  let channel = guild.channels.cache.get(musicsettings.channel);
                  let message = await channel.messages.fetch(messageId).catch(() => null);
                  if(message) {
                    //edit the message so that it's right!
                    var data = await require(`${process.cwd()}/handlers/erela_events/musicsystem`).generateQueueEmbed(client, message.guild.id)
                    message.edit(data).catch(() => null)
                  }
                }
              }
              return;
            }
          }
        }
        } catch (e) {
            console.log(String(e.stack).grey.bgRed)
            return message.reply({embeds: [new MessageEmbed()
                .setColor(es.wrongcolor)
    						.setFooter(client.getFooter(es))
                .setTitle(client.la[ls].common.erroroccur)
                .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-radio"]["variable9"]))
            ]});
        }
        async function channelsetup(channel, msg){
          await client.musicsettings.set(message.guild.id+".channel", channel.id);
          await client.musicsettings.set(message.guild.id+".message", msg.id);
        }
    },
};