const { Manager } = require("discord-hybrid-sharding");
const config = require("./botconfig/config.json");
const colors = require("colors");

const totalShards = 2; // suggested is to make it that 600-900 Servers are per shard, if u want to stay save, make it that it"s 400 servers / shard, and once it reached the ~1k mark, change the amount and restart
const shardsPerCluster = 6; // suggested is: 2-8

const manager = new Manager("./index.js", { 
    token: process.env.token || config.token,    
    // shardList: [ 0, 1, 2, 3, 4, 5 ], // if only those shards on that host etc.
    totalShards: totalShards, // amount or: "auto"
    shardsPerClusters: shardsPerCluster || 2, // amount of shards / cluster
    mode: "worker", // "process" or: "worker"
    respawn: true, 
    usev13: true,
    keepAlive: {
       interval: 20000,
       maxMissedHeartbeats: 5,
       maxClusterRestarts: 3,
    }
});
manager.on("clusterCreate", cluster => {
    console.log(`[SHARDING-MANAGER]: `.magenta + `Launched Cluster #${cluster.id} | ${cluster.id+1}/${cluster.manager.totalClusters} [${cluster.manager.shardsPerClusters}/${cluster.manager.totalShards} Shards]`.green)

    cluster.on("death", function () {
        console.log(`${colors.red.bold(`Cluster ${cluster.id} died..`)}`);
    });

    cluster.on("message", async (msg) => {
        if(!msg._sCustom) return
        if (msg.dm) {
            const { interaction, message, dm, packet } = msg
            await manager.broadcast({ interaction, message, dm, packet })
        }
    })
    cluster.on("error", e => {
        console.log(`${colors.red.bold(`Cluster ${cluster.id} errored ..`)}`);
        console.error(e);
    })
    
    cluster.on("disconnect", function () {
        console.log(`${colors.red.bold(`Cluster ${cluster.id} disconnected..`)}`);
    });

    cluster.on("reconnecting", function () {
        console.log(`${colors.yellow.bold(`Cluster ${cluster.id} reconnecting..`)}`);
    });

    cluster.on("close", function (code) {
        console.log(`${colors.red.bold(`Cluster ${cluster.id} close with code ${code}`)}`);
    });

    cluster.on("exit", function (code) {
        console.log(`${colors.red.bold(`Cluster ${cluster.id} exited with code ${code}`)}`);
    });
});
manager.on("debug", (d) => d.includes("[CM => Manager] [Spawning Clusters]") ? console.log(d) : "")
manager.spawn({timeout: -1});
