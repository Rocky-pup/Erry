module.exports = {
  apps : [{
      name: `Erry`, //the Namespace
      script: './startshard.js', //the path where to start
      //max_restarts: 5, //to limit the maximum restarts... not sugested
      cron_restart: "0 3 * * *", //to restart at 3:00
      max_memory_restart: "5G", //restart at 1GB of Ram
      watch: true, //restart on file changes
      }]
      };

