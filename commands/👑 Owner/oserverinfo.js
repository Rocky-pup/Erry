const Discord = require("discord.js");
const {MessageEmbed} = require("discord.js");
const config = require(`../../botconfig/config.json`)
var ee = require(`../../botconfig/embed.json`)
const emoji = require(`../../botconfig/emojis.json`);
const moment = require("moment")
const { swap_pages2, handlemsg } = require(`../../handlers/functions`)
module.exports = {
  name: "oserverinfo",
  aliases: ["osinfo"],
  type: "info",
  category: "👑 Owner",
  description: "Shows info about a server (for owner only)",
  usage: "oserverinfo <guild id>",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    if (!config.ownerIDS.some(r => r.includes(message.author?.id)))
    return message.channel.send({embeds : [new MessageEmbed()
      .setColor(es.wrongcolor)
      .setFooter(client.getFooter(es))
      .setTitle(eval(client.la[ls]["cmds"]["owner"]["reloadbot"]["variable1"]))
      .setDescription(eval(client.la[ls]["cmds"]["owner"]["reloadbot"]["variable2"]))
    ]});
    
      if (!args[0])
        return message.channel.send({embeds :[new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle(eval(client.la[ls]["cmds"]["owner"]["cmdreload"]["variable2"]))
        ]});

      var guildd = client.guilds.cache.get(args[0]);
      let ownerr = client.users.cache.get(guildd.ownerId)

      return message.channel.send({embeds : [new MessageEmbed()
        .setColor(es.color)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].cmds.info.serverinfo.field1)
        .setDescription(`<@${ownerr.id}> \n\`${ownerr.tag}\``)
      ]});
}
}


