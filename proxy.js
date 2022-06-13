var proxy = require("node-tcp-proxy");
const axios = require("axios");
const { exec, execSync } = require("child_process");
let isUp = false;
const ProxyPort = 8080;
const DBURL = "localhost";
const DBPORT = 27017;
//  6 seconds , but you can set any time you want
const MaxEC2MinutesIdleTime = 0.1;
const maxEC2IdleTimeMs = 60000 * MaxEC2MinutesIdleTime;
console.log(`Process pid ${process.pid}`);
let turnoff;
proxy.createProxy(ProxyPort, DBURL, DBPORT, {
  upstream: async function (context, data) {
    // Check if AWS EC2 is not up
    if (!isUp) {
      isUp = true;
      console.log("Turning EC2 on...");
      // Input your CLI Script to awake your EC2 here with execSync
      // execSync("turn on instance command" );
      const date = new Date();
      // Check if intance is alreadyUp
      /**
       * while(instance not up){
       *
       * Check instance status
       *
       * sleep 1 second
       *
       * }
       *
       */

      // Simulates delay for instance getting up and checking it with http
      await axios.get("http://localhost:3000/");
      const date2 = new Date();
      console.log(`Turn EC2 on took : ${date2.getTime() - date.getTime()}ms`);
    }
    // erase old EC2 idle live timer
    if (turnoff) {
      clearTimeout(turnoff);
    }
    // create new EC2 idle live timer
    turnoff = setTimeout(() => {
      // once EC2 Max idle time is done , turn off instance
      console.log("Server max idle time has passed. Turning instance off...");
      // execSync("turn off instance command" );
      console.log("Turning EC2 off...");
      isUp = false;
    }, maxEC2IdleTimeMs);

    return data;
  },
});
