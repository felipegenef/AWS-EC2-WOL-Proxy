var proxy = require("node-tcp-proxy");
const { EC2Client } = require("@aws-sdk/client-ec2");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const NumberOfObjects = 3;
const MaxSizeOfKeysInKB = 10;
const Shared = require("mmap-object");
const arg = require("arg");
function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--proxyPort": Number,
      "--proxyToIp": String,
      "--proxyToPort": Number,
      "--maxEc2Idle": Number,
    },
    { argv: rawArgs.slice(2) }
  );
  return {
    proxyPort: args["--proxyPort"] || 8080,
    proxyToIp: args["--proxyToIp"] || "localhost",
    proxyToPort: args["--proxyToPort"] || 3000,
    maxEc2Idle: args["--maxEc2Idle"] || 0.1,
  };
}
const args = parseArgumentsIntoOptions(process.argv);
// Set the AWS Region.
// const REGION = "REGION"; //e.g. "us-east-1"
// Create anAmazon EC2 service client object.
// const ec2Client = new EC2Client({ region: REGION });
// const paramsStart = { InstanceIds: ["INSTANCE_ID"] }; // Array of INSTANCE_IDs
// const paramsStop = { InstanceIds: ["INSTANCE_ID"],hibernate:true }; // Array of INSTANCE_IDs

const ProxyPort = args.proxyPort;
const ProxyToURL = args.proxyToIp;
const ProxyToPort = args.proxyToPort;
//  6 seconds , but you can set any time you want
const MaxEC2MinutesIdleTime = args.maxEc2Idle;
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
    // Simulates delay for instance getting up and checking it with http
    let counter = 0;
    while (counter != 4) {
      counter++;
      // const data = await ec2Client.send(new DescribeInstancesCommand({}));
      //  console.log("Success", JSON.stringify(data));

      // sleep 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

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

  proxy.createProxy(ProxyPort, ProxyToURL, ProxyToPort, {
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
