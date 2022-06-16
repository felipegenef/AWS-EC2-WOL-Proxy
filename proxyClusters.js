var proxy = require("node-tcp-proxy");
const { EC2Client } = require("@aws-sdk/client-ec2");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const NumberOfObjects = 3;
const MaxSizeOfKeysInKB = 10;
const Shared = require("mmap-object");

// Set the AWS Region.
// const REGION = "REGION"; //e.g. "us-east-1"
// Create anAmazon EC2 service client object.
// const ec2Client = new EC2Client({ region: REGION });
// const paramsStart = { InstanceIds: ["INSTANCE_ID"] }; // Array of INSTANCE_IDs
// const paramsStop = { InstanceIds: ["INSTANCE_ID"],hibernate:true }; // Array of INSTANCE_IDs

const ProxyPort = 8080;
const DBURL = "localhost";
const DBPORT = 3000;
//  6 seconds , but you can set any time you want
const MaxEC2MinutesIdleTime = 0.1;
const maxEC2IdleTimeMs = 60000 * MaxEC2MinutesIdleTime;

let turnoff;
/**
 *                                     Master process
 * Master process is responsable for load balancing requests, setting variables, spawning workers,
 * respawning workers when some worker exit , monitoring, turnign on Ec2 instances and turning off EC2 on idle.
 *
 *
 *
 */
if (cluster.isMaster) {
  console.log("Master proxy ", "running on", "[", `${process.pid}`, "]");
  async function setEC2UP() {
    console.log("Turning EC2 on...");
    // Input your CLI Script to awake your EC2 here
    // const data = await ec2Client.send(new StartInstancesCommand(paramsStart));
    // console.log("Success", data.StartingInstances);
    const date = new Date();
    // Check if intance is alreadyUp
    /**
     * while(instance not up){
     *
     *     const data = await ec2Client.send(new DescribeInstancesCommand({}));
     *      console.log("Success", JSON.stringify(data));
     *
     * sleep 1 second
     *  await new Promise((resolve) => setTimeout(resolve, 1000));
     *
     * }
     *
     */

    // Simulates delay for instance getting up and checking it with http
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const date2 = new Date();
    console.log(`Turn EC2 on took : ${date2.getTime() - date.getTime()}ms`);
  }
  async function handleMessage(message) {
    if (message?.status == true) {
      if (ProcessDB["isSettingEc2Up"] != 1) {
        ProcessDB["isSettingEc2Up"] = 1;
        await setEC2UP();
        ProcessDB["isUp"] = 1;
      }
    }

    if (message?.clearTimeout == true) {
      // erase old EC2 idle live timer
      if (turnoff) {
        clearTimeout(turnoff);
      }
      // create new EC2 idle live timer
      turnoff = setTimeout(async () => {
        // once EC2 Max idle time is done , turn off instance
        console.log("Server max idle time has passed.");
        console.log("Turning EC2 off...");
        // const data = await ec2Client.send(new StopInstancesCommand(paramsStop));
        // console.log("Success", data.StoppingInstances);
        ProcessDB["isUp"] = 0;
      }, maxEC2IdleTimeMs);
    }
  }
  const ProcessDB = new Shared.Create(
    "./ProxyWorkersDB/processDB",
    MaxSizeOfKeysInKB,
    NumberOfObjects
  );
  ProcessDB["isUp"] = 0;
  ProcessDB["isSettingEc2Up"] = 0;

  for (var i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.on("message", handleMessage);
  }
  cluster.on("exit", (worker) => {
    console.log("Worker died");
    const newWorker = cluster.fork();
    newWorker.on("message", handleMessage);
  });
} else {
  /**
   *                  Worker process
   * Worker process is responsable for redirecting tcp messages and waiting master turn on and off EC2s
   *
   *
   *
   */
  console.log("Worker proxy ", "running on", "[", `${process.pid}`, "]");
  const ProcessDB = new Shared.Open("./ProxyWorkersDB/processDB");

  proxy.createProxy(ProxyPort, DBURL, DBPORT, {
    upstream: async function (context, data) {
      // Check if AWS EC2 is not up
      if (!ProcessDB["isUp"]) {
        process.send({ status: true });
        while (ProcessDB["isUp"] != 1) {
          // await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      process.send({ clearTimeout: true });

      return data;
    },
  });
}
