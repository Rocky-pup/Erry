const {
	MessageEmbed, MessageButton, MessageActionRow
} = require("discord.js")
const config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const { handlemsg } = require(`../../handlers/functions`)
module.exports = {
  name: "dashboard",
  category: "🔰 Info",
  aliases: [""],
  usage: "dashboard",
  description: "Gives you link on dashboard",
  type: "bot",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    
    try {
       message.reply({ 
          embeds: [new MessageEmbed()
            .setColor(es.color)
            .setTitle(client.la[ls].cmds.info.dashboard.title)
            .setDescription(client.la[ls].cmds.info.dashboard.subtitle+`\n[${client.la[ls].cmds.info.dashboard.click}](http://erry.sytes.net)`)
            .setURL(`http://erry.sytes.net`)
            .setFooter(es.footertext)]
        });
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["info"]["color"]["variable2"]))
      ]});
    }
  }
}

