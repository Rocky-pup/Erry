var {
  MessageEmbed, MessageButton, MessageActionRow, Permissions
} = require("discord.js"),
ms = require("ms"),

config = require(`${process.cwd()}/botconfig/config.json`),
emoji = require("../../botconfig/emojis.json"),
ee = require(`${process.cwd()}/botconfig/embed.json`),

{
  createBar,
  format,
  check_if_dj,
  databasing,
  autoplay
} = require(`../functions`),
playermanager = require("../../handlers/playermanager"),

playercreated = new Map(),
collector = false,
mi;
module.exports = (client) => {
  client.manager
    .on("playerCreate", async (player) => {
      playercreated.set(player.guild)
    })
    .on("playerMove", async (player, oldChannel, newChannel) => {
      if (!newChannel) {
        await player.destroy();
      } else {
        player.voiceChannel = newChannel;
        if (player.paused) return;
        setTimeout(() => {
          player.pause(true);
          setTimeout(() => player.pause(false), client.ws.ping * 2);
        }, client.ws.ping * 2);
      }
    })
    .on("playerDestroy", async (player) => {
      
      if(player.textChannel && player.guild){
        let Queuechannel = await client.getChannel(player.textChannel).catch(() => null)

        if(Queuechannel && Queuechannel.permissionsFor(Queuechannel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)){
          Queuechannel.messages.fetch(player.get("currentmsg")).then(currentSongPlayMsg => {
            if(currentSongPlayMsg && currentSongPlayMsg.embeds && currentSongPlayMsg.embeds[0]){
              var embed = currentSongPlayMsg.embeds[0];
              embed.author.iconURL = "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png"
              embed.footer.text += "\n\n⛔️ SONG & QUEUE ENDED! | Player got DESTROYED (stopped)"
              currentSongPlayMsg.edit({embeds: [embed], components: []}).catch(() => null)
            }
          }).catch(() => null)
        }
        const musicsettings = await client.musicsettings.get(player.guild)
        if(musicsettings.channel && musicsettings.channel.length > 5){
          let messageId = musicsettings.message;
          let guild = await client.guilds.cache.get(player.guild)
          if(guild && messageId) {
            let channel = guild.channels.cache.get(musicsettings.channel);
            let message = await channel.messages.fetch(messageId).catch(() => null);
            if(message) {
              //edit the message so that it's right!
              var data = await  require("./musicsystem").generateQueueEmbed(client, player.guild, true)
              message.edit(data).catch(() => null)
              if(musicsettings.channel == player.textChannel){
                return;
              }
            }
          }
        }
      }
      
    })
    .on("trackStart", async (player, track) => {
      try {
        try{
          await client.stats.add(player.guild+".songs", 1); //counting our Database stats for SERVER
          await client.stats.add("global.songs", 1);
        } catch (e) {}
        let edited = false;
        const Settings = await client.settings.get(player.guild)
        if(playercreated.has(player.guild)){
          player.set("eq", "💣 None");
          player.set("filter", "🧨 None");
          await player.setVolume(Settings.defaultvolume || 30)
          await player.set("autoplay", Settings.defaultap || false);
          await player.set(`afk`, false)
          if(Settings.defaulteq || false){
            await player.setEQ(client.eqs.music);
          }
          databasing(client, player.guild, player.get("playerauthor"));
          playercreated.delete(player.guild); // delete the playercreated state from the thing
        }
        const musicsettings = await client.musicsettings.get(player.guild)
        if(musicsettings.channel && musicsettings.channel.length > 5){
          let messageId = musicsettings.message;
          let guild = await client.guilds.cache.get(player.guild)
          if(guild && messageId) {
            let channel = guild.channels.cache.get(musicsettings.channel);
            let message = await channel.messages.fetch(messageId).catch(() => null);
            if(message) {
              //edit the message so that it's right!
              var data = await  require("./musicsystem").generateQueueEmbed(client, player.guild)
              message.edit(data).catch(() => null)
              if(musicsettings.channel == player.textChannel){
                return;
              }
            }
          }
        }
        if(player.textChannel && player.get("previoustrack")){
          if(!collector.ended){
            try{
              collector?.stop()
            } catch (e) {
            }
          }
          let channel = await client.getChannel(player.textChannel).catch(() => null)
          if(channel && channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)){
            channel.messages.fetch(player.get("currentmsg")).then(currentSongPlayMsg => {
              if(currentSongPlayMsg && currentSongPlayMsg.embeds && currentSongPlayMsg.embeds[0]){
                var embed = currentSongPlayMsg.embeds[0];
                embed.author.iconURL = "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png"
                embed.footer.text += "\n⛔️ SONG ENDED!"
                currentSongPlayMsg.edit({embeds: [embed], components: []}).catch(() => null)
              }
            }).catch(() => null)
          }
        }
        //votes for skip --> 0
        player.set("votes", "0");
        //set the vote of every user to FALSE so if they voteskip it will vote skip and not remove voteskip if they have voted before bruh
        const guild = client.guilds.cache.get(player.guild)
        for (var userid of guild.members.cache.map(member => member.user.id))
          player.set(`vote-${userid}`, false);
        //set the previous track just have it is used for the autoplay function!
        player.set("previoustrack", track);
        //if that's disabled return
        if(Settings.playmsg === false){
          return;
        }
        // playANewTrack(client,player,track);
        let playdata = generateQueueEmbed(client, player, track)
        //Send message with buttons
        let channel = await client.getChannel(player.textChannel).catch(() => null)
        if(channel && channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)){
          let swapmsg = await channel.send(playdata).then(msg => {
            player.set("currentmsg", msg.id);
            return msg;
          })
          //create a collector for the thinggy
          collector = swapmsg.createMessageComponentCollector({filter: (i) => i?.isButton() && i?.user && i?.message.author?.id == client.user.id, time: track.duration > 0 ? track.duration : 600000 }); //collector for 5 seconds
          //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
          collector.on('collect', async i => {
              let { member } = i;
              const { channel } = member.voice
              const player = client.manager.players.get(i?.guild.id);
              if (!player)
                return i?.reply({content: `${client.la[ls].cmds.music.musicsystem.nothingplay}`, ephemeral: true})
                
              if (!channel)
                return i?.reply({
                  content: `${client.la[ls].cmds.music.musicsystem.joinvc}`,
                  ephemeral: true
                })                  
              if (channel.id !== player.voiceChannel)
                return i?.reply({
                  content: `${client.la[ls].cmds.music.musicsystem.joinmevc} <#${player.voiceChannel}>**`,
                  ephemeral: true
                })
              const es = Settings.embed || ee;
              const dj = await check_if_dj(client, member, player.queue.current);
              if(i?.customId != `10` && dj) {
                return i?.reply({embeds: [new MessageEmbed()
                  .setColor(es.wrongcolor)
                  .setFooter(client.getFooter(es))
                  .setTitle(client.la[ls].cmds.music.musicsystem.djerr)
                  .setDescription(`${client.la[ls].cmds.music.musicsystem.djroles}\n${dj}`)
                ],
                ephemeral: true});
              }

              
              //skip
              if(i?.customId == "1") {
                //if ther is nothing more to skip then stop music and leave the Channel
                let ls = await client.settings.get(i?.guild.id+ ".language")
                if (player.queue.size == 0) {
                  //if its on autoplay mode, then do autoplay before leaving...
                  if(player.get("autoplay")) return autoplay(client, player, "skip");
                  i?.reply({
                    embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTimestamp()
                    .setTitle(client.la[ls].cmds.music.stop.variable1)
                    .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                  })
                  edited = true;
                  player.destroy()
                  return
                }
                //skip the track
                player.stop();
                return i?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(es.color)
                  .setTimestamp()
                  .setTitle(client.la[ls].cmds.music.skip.title2)
                  .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
              }



              //stop
              if(i?.customId == "2") {
                let ls = await client.settings.get(i?.guild.id+ ".language")
                //Stop the player
                i?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(es.color)
                  .setTimestamp()
                  .setTitle(client.la[ls].cmds.music.stop.variable1)
                  .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                }) 
                edited = true;
                player.destroy()
              }



              //pause/resume
              if(i?.customId == "3") {
                let ls = await client.settings.get(i?.guild.id+ ".language")
                if (!player.playing){
                  player.pause(false);
                  i?.reply({
                    embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTimestamp()
                    .setTitle(client.la[ls].cmds.music.musicsystem.resume)
                    .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                  })
                } else{
                  //pause the player
                  player.pause(true);

                  i?.reply({
                    embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTimestamp()
                    .setTitle(client.la[ls].cmds.music.musicsystem.pause)
                    .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                  })
                }
                var data = generateQueueEmbed(client, player, track)
                swapmsg.edit(data).catch((e) => {
                  //console.error(e)
                })
              }



              //autoplay
              if(i?.customId == "4") {
                //pause the player
                player.set(`autoplay`, !player.get(`autoplay`))
                var data = generateQueueEmbed(client, player, track)
                swapmsg.edit(data).catch((e) => {
                  //console.error(e)
                })
                i?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(es.color)
                  .setTimestamp()
                  .setTitle(`${player.get(`autoplay`) ? `:white_check_mark: **Enabled Autoplay**`: `:x: **Disabled Autoplay**`}`)
                  .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
              }


              //Shuffle
              if(i?.customId == `5`){
                //set into the player instance an old Queue, before the shuffle...
                player.set(`beforeshuffle`, player.queue.map(track => track));
                //shuffle the Queue
                player.queue.shuffle();
                //Send Success Message
                i?.reply({
                  embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTimestamp()
                    .setTitle(`🔀 **Shuffled ${player.queue.length} Songs!**`)
                    .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
              }


              //Songloop
              if(i?.customId == `6`){
                //if there is active queue loop, disable it + add embed information
                if (player.queueRepeat) {
                  player.setQueueRepeat(false);
                }
                //set track repeat to revers of old track repeat
                player.setTrackRepeat(!player.trackRepeat);
                i?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(es.color)
                  .setTimestamp()
                  .setTitle(`${player.trackRepeat ? `:white_check_mark: **Enabled Song Loop**`: `:x: **Disabled Song Loop**`}`)
                  .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                var data = generateQueueEmbed(client, player, track)
                swapmsg.edit(data).catch((e) => {
                  //console.error(e)
                })
              }


              //QueueLoop
              if(i?.customId == `7`){
                //if there is active queue loop, disable it + add embed information
                if (player.trackRepeat) {
                  player.setTrackRepeat(false);
                }
                //set track repeat to revers of old track repeat
                player.setQueueRepeat(!player.queueRepeat);
                i?.reply({
                  embeds: [new MessageEmbed()
                  .setColor(es.color)
                  .setTimestamp()
                  .setTitle(`${player.queueRepeat ? `:white_check_mark: **Enabled Queue Loop**`: `:x: **Disabled Queue Loop**`}`)
                  .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
                var data = generateQueueEmbed(client, player, track)
                swapmsg.edit(data).catch((e) => {
                  //console.error(e)
                })
              }


              //Forward
              if(i?.customId == `8`){
                let ls = await client.settings.get(i?.guild.id+ ".language")
                //get the seektime variable of the user input
                let seektime = Number(player.position) + 10 * 1000;
                //if the userinput is smaller then 0, then set the seektime to just the player.position
                if (10 <= 0) seektime = Number(player.position);
                //if the seektime is too big, then set it 1 sec earlier
                if (Number(seektime) >= player.queue.current.duration) seektime = player.queue.current.duration - 1000;
                //seek to the new Seek position
                player.seek(Number(seektime));
                collector.resetTimer({time: (player.queue.current.duration - player.position) * 1000})
                i?.reply({
                  embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTimestamp()
                    .setTitle(client.la[ls].cmds.music.musicsystem.forward)
                    .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
              }

              
              //Rewind
              if(i?.customId == `9`){
                let ls = await client.settings.get(i?.guild.id+ ".language")
                let seektime = player.position - 10 * 1000;
                if (seektime >= player.queue.current.duration - player.position || seektime < 0) {
                  seektime = 0;
                }
                //seek to the new Seek position
                player.seek(Number(seektime));
                collector.resetTimer({time: (player.queue.current.duration - player.position) * 1000})
                i?.reply({
                  embeds: [new MessageEmbed()
                    .setColor(es.color)
                    .setTimestamp()
                    .setTitle(client.la[ls].cmds.music.musicsystem.rewind)
                    .setFooter(client.getFooter(`${client.la[ls].cmds.music.musicsystem.actionby} ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true})))]
                })
              }
          });  
        }
                
      } catch (e) {
        console.log(String(e.stack).grey.yellow) /* */
      }
    })
    .on("trackStuck", async (player, track, payload) => {
      await player.stop();
      if(player.textChannel){
        let channel = await client.getChannel(player.textChannel).catch(() => null)
        if(channel && channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)){
          channel.messages.fetch(player.get("currentmsg")).then(currentSongPlayMsg => {
            if(currentSongPlayMsg && currentSongPlayMsg.embeds && currentSongPlayMsg.embeds[0]){
              var embed = currentSongPlayMsg.embeds[0];
              embed.author.iconURL = "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png"
              embed.footer.text += "\n⚠️⚠️⚠️ SONG STUCKED ⚠️⚠️!"
              currentSongPlayMsg.edit({embeds: [embed], components: []}).catch(() => null)
            }
          }).catch(() => null)
        }
        const musicsettings = await client.musicsettings.get(player.guild)
        if(musicsettings.channel && musicsettings.channel.length > 5){
          let messageId = musicsettings.message;
          let guild = await client.guilds.cache.get(player.guild)
          if(guild && messageId) {
            let channel = guild.channels.cache.get(musicsettings.channel);
            let message = await channel.messages.fetch(messageId).catch(() => null);
            if(message) {
              //edit the message so that it's right!
              var data = await  require("./musicsystem").generateQueueEmbed(client, player.guild)
              message.edit(data).catch(() => null)
              if(musicsettings.channel == player.textChannel){
                return;
              }
            }
          }
        }
      }
    })
    .on("trackError", async (player, track, payload) => {
      await player.stop();
      if(player.textChannel){
        let channel = await client.getChannel(player.textChannel).catch(() => null)
        if(channel && channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)){
          channel.messages.fetch(player.get("currentmsg")).then(currentSongPlayMsg => {
            if(currentSongPlayMsg && currentSongPlayMsg.embeds && currentSongPlayMsg.embeds[0]){
              var embed = currentSongPlayMsg.embeds[0];
              embed.author.iconURL = "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png"
              embed.footer.text += "\n⚠️⚠️⚠️ SONG CRASHED ⚠️⚠️!"
              currentSongPlayMsg.edit({embeds: [embed], components: []}).catch(() => null)
            }
          }).catch(() => null)
        }
        const musicsettings = await client.musicsettings.get(player.guild)
        if(musicsettings.channel && musicsettings.channel.length > 5){
          let messageId = musicsettings.message;
          let guild = await client.guilds.cache.get(player.guild)
          if(guild && messageId) {
            let channel = guild.channels.cache.get(musicsettings.channel);
            let message = await channel.messages.fetch(messageId).catch(() => null);
            if(message) {
              //edit the message so that it's right!
              var data = await  require("./musicsystem").generateQueueEmbed(client, player.guild)
              message.edit(data).catch(() => null)
              if(musicsettings.channel == player.textChannel){
                return;
              }
            }
          }
        }
      }
    })
    .on("queueEnd", async (player) => {
      databasing(client, player.guild, player.get("playerauthor"));
      if (player.get("autoplay")) return autoplay(client, player);
      //DEvar TIME OUT
      try {
        player = client.manager.players.get(player.guild);
        if (!player.queue || !player.queue.current) {
          
        const musicsettings = await client.musicsettings.get(player.guild)
        if(musicsettings.channel && musicsettings.channel.length > 5){
          let messageId = musicsettings.message;
          let guild = await client.guilds.cache.get(player.guild)
          if(guild && messageId) {
            let channel = guild.channels.cache.get(musicsettings.channel);
            let message = await channel.messages.fetch(messageId).catch(() => null);
            if(message) {
              //edit the message so that it's right!
              var data = await  await  require("./musicsystem").generateQueueEmbed(client, player.guild, true)
              message.edit(data).catch(() => null)
              if(musicsettings.channel == player.textChannel){
                return;
              }
            }
          }
        }
          //if afk is enbaled return and not destroy the PLAYER
          if (player.get(`afk`)){
            return 
          }
          await player.destroy();
          
        }
      } catch (e) {
        console.log(String(e.stack).grey.yellow);
      }
    });
};


function generateQueueEmbed(client, player, track){
  var embed = new MessageEmbed().setColor(ee.color)
    embed.setAuthor(client.getAuthor(`${track.title}`, "https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif", track.uri))
    embed.setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
    embed.setFooter(client.getFooter(`Requested by: ${track.requester.tag}`, track.requester.displayAvatarURL({dynamic: true})));
  let skip = new MessageButton().setStyle('PRIMARY').setCustomId('1').setEmoji(`<:skip:977868613631483955>`)
  let stop = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji(`<:stop:977868613790863381>`)
  let pause = new MessageButton().setStyle('SECONDARY').setCustomId('3').setEmoji('<:pause:977868613623119883>')
  let autoplay = new MessageButton().setStyle('SUCCESS').setCustomId('4').setEmoji('🔁').setLabel(`Autoplay`)
  let shuffle = new MessageButton().setStyle('PRIMARY').setCustomId('5').setEmoji('🔀').setLabel(`Shuffle`)
  if (!player.playing) {
    pause = pause.setStyle('SUCCESS').setEmoji('<:play:977868616282275860>')
  } 
  if (player.get("autoplay")) {
    autoplay = autoplay.setStyle('SECONDARY')
  }
  let songloop = new MessageButton().setStyle('SUCCESS').setCustomId('6').setEmoji(`🔁`).setLabel(`Song`)
  let queueloop = new MessageButton().setStyle('SUCCESS').setCustomId('7').setEmoji(`🔂`).setLabel(`Queue`)
  let forward = new MessageButton().setStyle('PRIMARY').setCustomId('8').setEmoji('<:forward:977868614080286821>')
  let rewind = new MessageButton().setStyle('PRIMARY').setCustomId('9').setEmoji('<:rewind:977868614289989682>')
  let lyrics = new MessageButton().setStyle('PRIMARY').setCustomId('10').setEmoji('📝').setLabel(`Lyrics`).setDisabled();
  if (!player.queueRepeat && !player.trackRepeat) {
    songloop = songloop.setStyle('SUCCESS')
    queueloop = queueloop.setStyle('SUCCESS')
  }
  if (player.trackRepeat) {
    songloop = songloop.setStyle('SECONDARY')
    queueloop = queueloop.setStyle('SUCCESS')
  }
  if (player.queueRepeat) {
    songloop = songloop.setStyle('SUCCESS')
    queueloop = queueloop.setStyle('SECONDARY')
  }
  const row = new MessageActionRow().addComponents([pause, stop, skip]);
  return {
    embeds: [embed], 
    components: [row]
  }
}