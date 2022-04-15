module.exports = {
  apps : [{
      name: `Erry`, //the Namespace
      script: './startshard.js', //the path where to start
      //max_restarts: 5, //to limit the maximum restarts... not sugested
      max_memory_restart: "5G", //restart at 5GB of Ram
      },
      {
        name: "java",
        cwd: ".",
        script: "C:/Program Files/Java/jdk-11.0.11/bin/java",
        args:[
            "-jar",
            "C:/Users/Rockystream/Desktop/erry2.2.1/lavalink/1/Lavalink.jar",
            "server",
            "application.yml"
        ],
        max_memory_restart: "5G",
     }

    ]
      };
