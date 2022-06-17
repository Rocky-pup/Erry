const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
const ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { handlemsg } = require(`${process.cwd()}/handlers/functions`);
    module.exports = {
  name: `volume`,
  category: `🎶 Music`,
  aliases: [`vol`],
  description: `Changes the Volume`,
  usage: `volume <0-150>`,
  parameters: {
    "type": "music",
    "activeplayer": true,
    "check_dj": true,
    "previoussong": false
  },
  options: [
    {"Integer": { name: "volume", description: "To What % do you want to change the volume to?", required: true }}, 
  ],
  run: async (client, interaction, cmduser, es, ls, prefix, player, message) => {
    let GuildSettings = client.settings.get(`${interaction.guild.id}`)
    //

    if(GuildSettings.MUSIC === false) {
      return interaction?.reply({ephemeral: true, embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }
    try {
      let args = [interaction?.options.getInteger("volume")]
      //if the Volume Number is out of Range return error msg
      if (Number(args[0]) <= 0 || Number(args[0]) > 150)
        return interaction?.reply({ephemeral: true, embeds:  [new MessageEmbed()
          .setColor(es.wrongcolor)
          .setTitle(eval(client.la[ls]["cmds"]["music"]["volume"]["variable1"]))
          .setDescription(eval(client.la[ls]["cmds"]["music"]["volume"]["variable2"]))
        ]});
      //if its not a Number return error msg
      if (isNaN(args[0]))
        return interaction?.reply({ephemeral: true, embeds : [new MessageEmbed()
          .setColor(es.wrongcolor)
          .setTitle(eval(client.la[ls]["cmds"]["music"]["volume"]["variable3"]))
          .setDescription(eval(client.la[ls]["cmds"]["music"]["volume"]["variable4"]))
        ]});
      //change the volume
      player.setVolume(Number(args[0]));
      //send success message
      const musicsettings = await client.musicsettings.get(player.guild)
      if(musicsettings.channel && musicsettings.channel.length > 5){
        let messageId = musicsettings.message;
        let guild = await client.guilds.cache.get(player.guild)
        if(guild && messageId) {
          let channel = guild.channels.cache.get(musicsettings.channel);
          let message = await channel.messages.fetch(messageId).catch(() => null);
          if(message) {
            //edit the message so that it's right!
            var data = await require(`${process.cwd()}/handlers/erela_events/musicsystem`).generateQueueEmbed(client, player.guild)
            message.edit(data).catch(() => null)
          }
        }
      }
      return interaction?.reply({ephemeral: true, embeds : [new MessageEmbed()
        .setTitle(eval(client.la[ls]["cmds"]["music"]["volume"]["variable5"]))
        .setDescription(eval(client.la[ls]["cmds"]["music"]["volume"]["variable6"]))
        .setColor(es.color)
      ]});
      
    } catch (e) {
      console.log(String(e.stack).dim.bgRed)
      return interaction?.reply({ephemeral: true, embeds :[new MessageEmbed()
        .setColor(es.wrongcolor)
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["music"]["volume"]["variable7"]))
      ]});
    }
  }
};

