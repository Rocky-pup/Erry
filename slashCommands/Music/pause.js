const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`${process.cwd()}/botconfig/config.json`);
const ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const {
  createBar,
  format
} = require(`${process.cwd()}/handlers/functions`);
const { handlemsg } = require(`${process.cwd()}/handlers/functions`);
    module.exports = {
  name: `pause`,
  description: `Pauses the Current Song`,
  parameters: {
    "type": "music",
    "activeplayer": true,
    "check_dj": true,
    "previoussong": false
  },
  run: async (client, interaction, cmduser, es, ls, prefix, player, message) => {
    let GuildSettings = client.settings.get(`${interaction.guild.id}`)
    //

    if(GuildSettings.MUSIC === false) {
      return interaction?.reply({ephemeral: true, embed : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }
    try {
      //if the player is paused return error
      if (!player.playing)
        return interaction?.reply({ephemeral: true, embeds:  [new MessageEmbed()
          .setColor(es.wrongcolor)
          .setTitle(eval(client.la[ls]["cmds"]["music"]["pause"]["variable1"]))
          .setDescription(eval(client.la[ls]["cmds"]["music"]["pause"]["variable2"]))
        ]});
      //pause the player
      player.pause(true);
      //return success message
      interaction?.reply({ephemeral: true, embeds: [new MessageEmbed()
        .setColor(es.color)
        .setTitle(`${emoji?.msg.pause} Paused the Track!`)
      ]})
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
    } catch (e) {
      console.log(String(e.stack).dim.bgRed)
      return message.reply({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)

        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["music"]["pause"]["variable3"]))
      ]});
    }
  }
};

