//import the config.json file
const config = require(`${process.cwd()}/botconfig/config.json`)
var ee = require(`${process.cwd()}/botconfig/embed.json`);
var emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const ms = require("ms");
var {
    MessageEmbed, Permissions
} = require(`discord.js`);
const { databasing, delay } = require(`./functions`)
const countermap = new Map()
const messagesmap = new Map()
module.exports = client => {
    
    client.on("messageUpdate", (oldMessage, newMessage) => {
      checkSelfBot(newMessage)
    })
    client.on("messageCreate", message => {
        checkSelfBot(message)
    })
    async function checkSelfBot(message) {
        try{
            if (!message.guild || message.guild.available === false || !message.channel || message.author.bot) return;
            if (!message.embeds || !message.embeds[0] || message.embeds.length == 0 || message.embeds.some(e => e.type != "rich" || (e.footer && e.footer.text === "Twitter") || (e.author && e.author.url && e.author.url.includes('twitter.com')))) return; //means no self bot 
            let ls = client.settings.get(message.guild.id, "language")

            client.settings.ensure(message.guild.id, {
                antiselfbot: {
                    enabled: true,
                    action: "mute", // mute, kick, ban
                    mute_amount: 1
                },
            });
            client.settings.ensure(message.guild.id,{
                autowarn: {
                    antispam: false,
                    antiselfbot: false,
                    antimention: false,
                    antilinks: false,
                    antidiscord: false,
                    anticaps: false,
                    blacklist: false,
                    ghost_ping_detector: false,
                }
            })
            let autowarn = client.settings.get(message.guild.id, "autowarn");
            let antiselfbot = client.settings.get(message.guild.id, "antiselfbot");
            let mute_amount = antiselfbot.mute_amount;
            let member = message.member
            if(!antiselfbot.enabled) return
            let es = client.settings.get(message.guild.id, "embed");
            try {
                  if(autowarn.antiselfbot){
                      client.userProfiles.ensure(message.author.id, {
                          id: message.author.id,
                          guild: message.guild.id,
                          totalActions: 0,
                          warnings: [],
                          kicks: []
                        });
                        const newActionId = client.modActions.autonum;
                        client.modActions.set(newActionId, {
                          user: message.author.id,
                          guild: message.guild.id,
                          type: 'warning',
                          moderator: message.author.id,
                          reason: "AntiSelfBot Autowarn",
                          when: new Date().toLocaleString(`de`),
                          oldhighesrole: message.member.roles ? message.member.roles.highest : `Had No Roles`,
                          oldthumburl: message.author.displayAvatarURL({
                            dynamic: true
                          })
                        });
                        // Push the action to the user's warnings
                        client.userProfiles.push(message.author.id, newActionId, 'warnings');
                        client.userProfiles.inc(message.author.id, 'totalActions');
                        client.stats.push(message.guild.id+message.author.id, new Date().getTime(), "warn"); 
                        const warnIDs = client.userProfiles.get(message.author.id, 'warnings')
                        const warnData = warnIDs.map(id => client.modActions.get(id));
                        let warnings = warnData.filter(v => v.guild == message.guild.id);
                          message.channel.send({
                              embeds: [
                                  new MessageEmbed().setAuthor(client.getAuthor(message.author.tag, message.member.displayAvatarURL({dynamic: true})))
                                  .setColor("ORANGE").setFooter(client.getFooter("ID: "+ message.author.id, message.author.displayAvatarURL({dynamic:true})))
                                  .setDescription(`> <@${message.author.id}> **received an autogenerated Warn - \`antiselfbot\`**!\n\n> **He now has \`${warnings.length} Warnings\`**`)
                              ]
                          });
                        let warnsettings = client.settings.get(message.guild.id, "warnsettings")
                        if(warnsettings.kick && warnsettings.kick == warnings.length){
                          if (!message.member.kickable)
                            message.channel.send({embeds :[new MessageEmbed()
                              .setColor(es.wrongcolor)
                              .setFooter(client.getFooter(es))
                              .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable8"]))
                            ]});
                          else {
                            try{
                              message.member.send({embeds : [new MessageEmbed()
                                .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                                .setFooter(client.getFooter(es))
                                .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable9"]))
                                .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable10"]))
                              ]});
                            } catch{
                              return message.channel.send({embeds :[new MessageEmbed()
                                .setColor(es.wrongcolor)
                                .setFooter(client.getFooter(es))
                                .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable11"]))
                                .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable12"]))
                              ]});
                            }
                            try {
                              message.member.kick({
                                reason: `Reached ${warnings.length} Warnings`
                              }).then(() => {
                                message.channel.send({embeds :[new MessageEmbed()
                                  .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                                  .setFooter(client.getFooter(es))
                                  .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable13"]))
                                  .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable14"]))
                                ]});
                              });
                            } catch (e) {
                              console.log(e.stack ? String(e.stack).grey : String(e).grey);
                              message.channel.send({embeds : [new MessageEmbed()
                                .setColor(es.wrongcolor)
                                .setFooter(client.getFooter(es))
                                .setTitle(client.la[ls].common.erroroccur)
                                .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable15"]))
                              ]});
                            }
                          }
                            
                        }
                        if(warnsettings.ban && warnsettings.ban == warnings.length){
                          if (!message.member.bannable)
                            message.channel.send({embeds : [new MessageEmbed()
                              .setColor(es.wrongcolor)
                              .setFooter(client.getFooter(es))
                              .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable16"]))
                            ]});
                            else {
                            try{
                              message.member.send({embeds :[new MessageEmbed()
                                .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                                .setFooter(client.getFooter(es))
                                .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable17"]))
                              ]});
                            } catch {
                              message.channel.send({embeds :[new MessageEmbed()
                                .setColor(es.wrongcolor)
                                .setFooter(client.getFooter(es))
                                .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable18"]))
                                .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable19"]))
                              ]});
                            }
                            try {
                              message.member.ban({
                                reason: `Reached ${warnings.length} Warnings`
                              }).then(() => {
                                message.channel.send({embeds :[new MessageEmbed()
                                  .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                                  .setFooter(client.getFooter(es))
                                  .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable20"]))
                                  .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable21"]))
                                ]});
                              });
                            } catch (e) {
                              console.log(e.stack ? String(e.stack).grey : String(e).grey);
                              message.channel.send({embeds :[new MessageEmbed()
                                .setColor(es.wrongcolor)
                                .setFooter(client.getFooter(es))
                                .setTitle(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable22"]))
                                .setDescription(eval(client.la[ls]["cmds"]["administration"]["warn"]["variable23"]))
                              ]});
                            }}
                        }
                        for(const role of warnsettings.roles){
                          if(role.warncount == warnings.length){
                            if(!message.member.roles.cache.has(role.roleid)){
                              message.member.roles.add(role.roleid).catch((O)=>{})
                            }
                          }
                        }
                  }
                  message.delete().catch(() => {});
                  if (!countermap.get(message.author.id)) countermap.set(message.author.id, 1)
                  setTimeout(() => {
                      countermap.set(message.author.id, Number(countermap.get(message.author.id)) - 1)
                      if (Number(countermap.get(message.author.id)) < 1) countermap.set(message.author.id, 1)
                  }, 15000)
                  countermap.set(message.author.id, Number(countermap.get(message.author.id)) + 1)

                  if (Number(countermap.get(message.author.id)) > mute_amount) {
                      if(antiselfbot.action == "mute"){
                        let time = 10 * 60 * 1000; let mutetime = time;
                        
                        member.timeout(mutetime, reason).then(() => {  
                          message.channel.send({embeds: [new MessageEmbed()
                              .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                              .setFooter(client.getFooter(es))
                              .setTitle(`${member.user.tag} Got muted due to using a SelfBot`)
                              .setDescription(`He/She/They will get unmuted after 10 Minutes`)
                          ]}).catch(() => {});
                        }).catch(() => {
                            return message.channel.send(`<:no:951013282607685632> **I could not timeout ${member.user.tag}**`).then(m => {
                                setTimeout(() => { m.delete().catch(() => {}) }, 5000);
                            });
                        });

                        countermap.set(message.author.id, 1)
                        
                      } 
                      if(antiselfbot.action == "kick") {
                        if(member.kickable) {
                          member.kick({reason: "Using a selfbot"}).then(m => {
                            message.channel.send({embeds: [new MessageEmbed()
                              .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                              .setFooter(client.getFooter(es))
                              .setTitle(`${member.user.tag} Got kicked for using a Selfbot`)
                            ]}).catch(() => {});
                          }).catch(e => {
                            message.channel.send({embeds: [new MessageEmbed()
                              .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                              .setFooter(client.getFooter(es))
                              .setTitle(`Could not kick ${member.user.tag} using a Selfbot`)
                              .setDescription(`\`\`\`${String(e.message ? e.message : e).substring(0, 2000)}\`\`\``)
                            ]}).catch(() => {});
                          })
                        } else {
                          message.channel.send({embeds: [new MessageEmbed()
                            .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                            .setFooter(client.getFooter(es))
                            .setTitle(`Could not kick ${member.user.tag} using a Selfbot`)
                            .setDescription(`\`\`\`Member is not kickable\`\`\``)
                          ]}).catch(() => {});
                        }
                      }
                      if(antiselfbot.action == "ban") {
                        if(member.bannable) {
                          member.kick({reason: "Using a selfbot"}).then(m => {
                            message.channel.send({embeds: [new MessageEmbed()
                              .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                              .setFooter(client.getFooter(es))
                              .setTitle(`${member.user.tag} Got banned for using a Selfbot`)
                            ]}).catch(() => {});
                          }).catch(e => {
                            message.channel.send({embeds: [new MessageEmbed()
                              .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                              .setFooter(client.getFooter(es))
                              .setTitle(`Could not ban ${member.user.tag} using a Selfbot`)
                              .setDescription(`\`\`\`${String(e.message ? e.message : e).substring(0, 2000)}\`\`\``)
                            ]}).catch(() => {});
                          })
                        } else {
                          message.channel.send({embeds: [new MessageEmbed()
                            .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                            .setFooter(client.getFooter(es))
                            .setTitle(`Could not ban ${member.user.tag} using a Selfbot`)
                            .setDescription(`\`\`\`Member is not bannable\`\`\``)
                          ]}).catch(() => {});
                        }
                      }
                  }
                  else {
                      return message.channel.send({embeds: [new MessageEmbed()
                          .setColor(es.wrongcolor)
                          .setFooter(client.getFooter(es))
                          .setTitle(`${member.user.tag} No Selfbots are allowed in here!`)
                          .setDescription(`Please stop using them`)
                      ]}).then(msg => setTimeout(()=>{msg.delete().catch(() => {})}, 3000)).catch(() => {});
                  }
                
            } catch (e) {
                console.log(String(e.stack).grey.bgRed)
                return message.channel.send({embeds: [new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es))
                    .setTitle(client.la[ls].common.erroroccur)
                    .setDescription(eval(client.la[ls]["handlers"]["anticapsjs"]["anticaps"]["variable7"]))
                ]}).catch(() => {});
            }
        }catch(e){console.log(String(e).grey)}
    }
}