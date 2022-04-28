const {
  MessageEmbed
} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const {
  duration, nFormatter, handlemsg
} = require(`${process.cwd()}/handlers/functions`)
const moment = require("moment")
const fs = require('fs')
let cpuStat = require("cpu-stat");
module.exports = {
  name: "botinfo",
  description: "Sends detailed info about the client",
  run: async (client, interaction, cmduser, es, ls, prefix, player, message) => {
    //things u can directly access in an interaction!
		const { member, channelId, guildId, applicationId, commandName, deferred, replied, ephemeral, options, id, createdTimestamp } = interaction; 
    const { guild } = member;
    
    try {
      
      await interaction?.reply({embeds: [new MessageEmbed()
        .setColor(es.color)
        .setFooter(client.getFooter("It could take up to 30 Seconds ...", client.user.displayAvatarURL()))
        .setAuthor(client.getAuthor(handlemsg(client.la[ls].cmds.info.commandcount.tempmsg), "https://cdn.discordapp.com/emojis/756773010123522058.gif"))
      ], ephemeral: true})
        let connectedchannelsamount = 0;
        let guilds = client.guilds.cache.map((guild) => guild);
        for (let i = 0; i < guilds.length; i++) {
            if (guilds[i].me.voice.channel) connectedchannelsamount += 1;
        }
      
      const totalGuilds = client.guilds.cache.size;
      const totalMembers = client.users.cache.size;
      countertest = 0;
    await interaction?.editReply({embeds: [new MessageEmbed()
      .setAuthor(client.user.tag + " Information", es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL(), `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`) 
      .setDescription(eval(client.la[ls]["cmds"]["info"]["botinfo"]["variable1"]))
      .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
      .addField(client.la[ls].cmds.info.botinfo.field1.title, handlemsg(client.la[ls].cmds.info.botinfo.field1.value, {totalGuilds: totalGuilds, totalMembers: totalMembers, connections: connectedchannelsamount, connectedchannelsamount: connectedchannelsamount}), true)
      .addField(client.la[ls].cmds.info.botinfo.field2.title, `\`\`\`yml\nNode.js: ${process.version}\nDiscord.js: v13.6.0\nEnmap: v5.8.4\`\`\``, true)
      .addField(client.la[ls].cmds.info.botinfo.field3.title, handlemsg(client.la[ls].cmds.info.botinfo.field3.value, {ram: (process.memoryUsage().heapUsed/1024/1024).toFixed(2)}))
      .addField(client.la[ls].cmds.info.botinfo.field4.title, `\`\`\`yml\nName: Rocky\nID: [913117505541775420]\`\`\``, true)
      .addField(client.la[ls].cmds.info.botinfo.field5.title, handlemsg(client.la[ls].cmds.info.botinfo.field5.value, {invitelink: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`}))
      .setFooter(es.footertext+ ` ︲ You're on Cluster #${client.cluster.id} and Shard #${message.guild.shard.id}`, es.footericon)], ephemeral: true});
      
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return interaction?.editReply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["info"]["color"]["variable2"]))
      ]});
    }
  }
}