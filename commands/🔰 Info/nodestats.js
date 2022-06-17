const {
    MessageEmbed
  } = require("discord.js");
  const config = require(`../../botconfig/config.json`);
  var ee = require(`../../botconfig/embed.json`);
  const emoji = require(`../../botconfig/emojis.json`);
  const {
    getRandomInt, GetGlobalUser, GetUser, handlemsg, dbEnsure
  } = require(`../../handlers/functions`)
  module.exports = {
    name: "nodestats",
    category: "🔰 Info",
    aliases: [],
    usage: "nodestats", 
    description: "Shows the Stats of a lavalink",
    type: "user",
    run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
      try{
        var embed = new MessageEmbed()
        .setColor(es.color).setFooter(client.getFooter(es))
        .setTitle(":white_check_mark:"+client.la[ls]["cmds"]["info"]["nodestats"]["title"])

        client.manager.nodes.forEach(node=>{    
          var stats = node.stats
          if(!stats) return message.reply(client.la[ls]["cmds"]["info"]["nodestats"]["err"])
        embed
          .addField("<:arrow:950884679114952715>**\`"+node.options.host+"\`**", "ㅤ", true)
          .addField(":notes: "+client.la[ls]["cmds"]["info"]["nodestats"]["field1"], `**\`${stats.playingPlayers}\`**`, true)
          .addField(":signal_strength: "+client.la[ls]["cmds"]["info"]["nodestats"]["field2"], `**\`${stats.cpu.systemLoad.toFixed(2)}%\`**\n\n`, true)
        });
        message.reply({embeds: [embed]})
      }catch (e) {
        console.log(String(e.stack).grey.bgRed)
        return message.reply({embeds : [new MessageEmbed()
          .setColor(es.wrongcolor).setFooter(client.getFooter(es))
          .setTitle(client.la[ls].common.erroroccur)
          .setDescription(`\`${e}\``)
        ]});
      }
    }
  }
  
 /* 
  stats: {
    playingPlayers: 1,
    memory: {
      reservable: 2061500416,
      used: 227881384,
      free: 27971160,
      allocated: 255852544
    },
    frameStats: { sent: 3000, deficit: 0, nulled: 0 },
    players: 1,
    cpu: {
      cores: 4,
      systemLoad: 0.08548128116284966,
      lavalinkLoad: 0.014083568059467658
    },
    uptime: 2177524
  }
}

  */