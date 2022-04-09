const {
    MessageEmbed
  } = require("discord.js");
  const config = require(`${process.cwd()}/botconfig/config.json`);
  var ee = require(`${process.cwd()}/botconfig/embed.json`);
  const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
  const {
    getRandomInt, handlemsg
  } = require(`${process.cwd()}/handlers/functions`)
  module.exports = {
    name: "addsongstostats",
    category: "👑 Owner",
    aliases: ["addsts"],
    cooldown: 1,
    usage: "addsongstostats [arg]",
    description: "Shows music Stats, like amount of Commands and played Songs etc.",
    type: "bot",
    run: async (client, message, args, cmduser, text, prefix) => {
      let stats = client.stats.get("global");
      while (stats.songs<args[0]){
      client.stats.inc(`global`, `songs`)
      }
      message.channel.send(`Succesfully setted songstats to ${stats.songs}`)
    }
}
  
  