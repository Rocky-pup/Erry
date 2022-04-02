﻿
/**********************************************************
 * @INFO  [TABLE OF CONTENTS]
 * 1  Import_Modules
   * 1.1 Validating script for advertisement
 * 2  CREATE_THE_DISCORD_BOT_CLIENT
 * 3  Load_Discord_Buttons_and_Discord_Menus
 * 4  Create_the_client.memer
 * 5  create_the_languages_objects
 * 6  Raise_the_Max_Listeners
 * 7  Define_the_Client_Advertisments
 * 8  LOAD_the_BOT_Functions
 * 9  Login_to_the_Bot
 * 
 *   BOT CODED BY: Rocky | 
 *********************************************************/



/**********************************************************
 * @param {1} Import_Modules for this FIle
 *********************************************************/
const Discord = require("discord.js");
const colors = require("colors");
const enmap = require("enmap");
const Cluster = require("discord-hybrid-sharding");
const fs = require("fs"); 
const OS = require('os');
const Events = require("events");
const emojis = require("./botconfig/emojis.json")
const config = require("./botconfig/config.json")
const advertisement = require("./botconfig/advertisement.json")
const { delay } = require("./handlers/functions")


/**********************************************************
 * @param {2} CREATE_THE_DISCORD_BOT_CLIENT with some default settings
 *********************************************************/
const client = new Discord.Client({
  fetchAllMembers: false,
  restTimeOffset: 0,
  failIfNotExists: false,
  shards: "auto",
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: false,
  },
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
  intents: [ Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_BANS,
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    //Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    //Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ],
  presence: {
    activities: [{name: `${config.status.text}`.replace("{prefix}", config.prefix), type: config.status.type, url: config.status.url}],
    status: "online"
  }
});



/**********************************************************
 * @param {4} Create_the_client.memer property from Api 
 *********************************************************/
const Meme = require("memer-api");
client.memer = new Meme("7Yj4j3k3K98"); // GET a TOKEN HERE: https://discord.gg/Mc2FudJkgP



/**********************************************************
 * @param {5} create_the_languages_objects to select via CODE
 *********************************************************/
client.la = { }
fs.readdir("./languages", (err, files) => {
  if (err) console.error(err);
  else {
    for(const lang of files.filter(file => file.endsWith(".json"))){
      client.la[`${lang.split(".json").join("")}`] = require(`./languages/${lang}`)
    }
    Object.freeze(client.la)
  }
})
//function "handlemsg(txt, options? = {})" is in /handlers/functions 



/**********************************************************
 * @param {6} Raise_the_Max_Listeners to 0 (default 10)
 *********************************************************/
client.setMaxListeners(0);
Events.defaultMaxListeners = 0;
process.env.UV_THREADPOOL_SIZE = OS.cpus().length;


/**********************************************************
 * @param {7} Define_the_Client_Advertisments from the Config File
 *********************************************************/
client.ad = {
  enabled: advertisement.adenabled,
  statusad: advertisement.statusad,
  spacedot: advertisement.spacedot,
  textad: advertisement.textad
}



/**********************************************************
 * @param {8} LOAD_the_BOT_Functions 
 *********************************************************/
//those are must haves, they load the dbs, events and commands and important other stuff
function requirehandlers(){
  ["extraevents", "clientvariables", "command", "loaddb", "events", "erelahandler", "slashCommands"].forEach(handler => {
    try{ require(`./handlers/${handler}`)(client); }catch (e){ console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
  ["twitterfeed", /*"twitterfeed2",*/ "livelog", "youtube", "tiktok"].forEach(handler=>{
    try{ require(`./social_log/${handler}`)(client); }catch (e){ console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
  [ "logger", "anti_nuke", "antidiscord", "antilinks","anticaps", "antispam", "blacklist", "keyword", "antimention", "autobackup",
    
    "apply", "ticket", "ticketevent",
    "roster", "joinvc", "epicgamesverification", "boostlog",
    
    "welcome", "leave", "ghost_ping_detector", "antiselfbot",

    "jointocreate", "reactionrole", "ranking", "timedmessages",
    
    "membercount", "autoembed", "suggest", "validcode", "dailyfact", "autonsfw",
    "aichat", "mute", "automeme", "counter"].forEach(handler => {
    try{ require(`./handlers/${handler}`)(client); }catch (e){ console.log(e.stack ? String(e.stack).grey : String(e).grey) }
  });
}requirehandlers();


/**********************************************************
 * @param {9} Login_to_the_Bot
 *********************************************************/
 client.cluster = new Cluster.Client(client); //Init the Client & So we can also access broadcastEval...
 client.login(process.env.token || config.token);
  
   /**
    * NEEDED TO HAVE DMS WORKING (for receiving messages and interaction)
    */
 client.cluster.on("message", async (msg) => {
   if(!msg._sCustom) return
   if(msg.dm && msg.message) {
     client.actions.MessageCreate.handle(msg.packet); //handle the raw api data, so that djs can use it
   }
   if(msg.dm && msg.interaction) {
     client.actions.InteractionCreate.handle(msg.packet); //handle the raw api data, so that djs can use it
   }
 })
 client.on("raw", (packet) => {
   if (client.cluster.id !== 0) return; // if not on the shard 0, return
   if (packet.t === "MESSAGE_CREATE" && !packet.d.guild_id) {
     client.cluster.send({
         dm: true,
         message: true,
         packet: packet.d
     }); //send the raw api packet data to the cluster, to receive it on the shards!
   }
 })
 client.on("interactionCreate", (interaction) => {
   if(client.cluster.id !== 0) return; // if not on the shard 0, return
   if(interaction.isSelectMenu() && !interaction.guildId && interaction.user.id != client.user?.id) {
     // all of the component types
     const Types = {
       "PING" : 1,
       "APPLICATION_COMMAND": 2,
       "MESSAGE_COMPONENT": 3,
       "APPLICATION_COMMAND_AUTOCOMPLETE": 4
     };
     // send the interaction data
     client.cluster.send({
       dm: true,
       interaction: true,
       packet: {
         version: 1,
         type: 3,
         token: interaction.token,
         member: {
           user: {
             username: interaction.user.username,
             public_flags: interaction.user.flags,
             id: interaction.user.id,
             discriminator: interaction.user.discriminator,
             bot: interaction.user.bot,
             avatar: interaction.user.avatar
           }
         },
         message: {
           type: 19,
           tts: false,
           timestamp: interaction.message.timestamp,
           pinned: false,
           message_reference: {
             message_id: interaction.message.id,
             guild_id: null,
             channel_id: interaction.message.channelId,
           },
           mentions: [],
           mention_roles: [],
           mention_everyone: false,
           id: interaction.message.id,
           flags: 0,
           embeds: interaction.message.embeds.map(e => e.toJSON()),
           edited_timestamp: null,
           content: interaction.message.content,
           components: interaction.message.components.map(c => c.toJSON()),
           channel_id: interaction.message.channelId,
           author: {
             username: client.user?.username,
             public_flags: client.user?.flags,
             id: client.user?.id,
             discriminator: client.user?.discriminator,
             bot: client.user?.bot,
             avatar: client.user?.avatar
           },
           attachments: interaction.message.attachments
         },
         user: {
           username: interaction.user?.username,
           public_flags: interaction.user?.flags,
           id: interaction.user?.id,
           discriminator: interaction.user?.discriminator,
           bot: interaction.user?.bot,
           avatar: interaction.user?.avatar
         },
         locale: interaction.locale,
         id: interaction.id,
         guild_locale: interaction.guildLocale,
         guild_id: interaction.guildId,
         data: {
           values: interaction.values,
           custom_id: interaction.customId,
           component_type: Types[interaction.type]
         },
         channel_id: interaction.channelId,
         application_id: interaction.applicationId,
       }
     });
   }
 });