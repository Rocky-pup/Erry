module.exports = {
  apps : [{
      name: `Erry`, //the Namespace
      script: './startshard.js', //the path where to start
      //max_restarts: 5, //to limit the maximum restarts... not sugested
      max_memory_restart: "5G", //restart at 5GB of Ram
      watch: true, //restart on file changes
      }]
      };

