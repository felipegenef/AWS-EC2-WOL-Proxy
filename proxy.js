var proxy = require("node-tcp-proxy");
const {
  EC2Client,
  StartInstancesCommand,
  StopInstancesCommand,
  DescribeInstancesCommand,
} = require("@aws-sdk/client-ec2");
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
const instanceId = "";
const args = parseArgumentsIntoOptions(process.argv);
// Set the AWS Region.

// Create anAmazon EC2 service client object.
const ec2Client = new EC2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "your key",
    secretAccessKey: "your secret",
  },
});
const paramsStart = { InstanceIds: [instanceId] }; // Array of INSTANCE_IDs
const paramsStop = { InstanceIds: [instanceId], hibernate: true }; // Array of INSTANCE_IDs
let isUp = false;
const ProxyPort = args.proxyPort;
const ProxyToURL = args.proxyToIp;
const ProxyToPort = args.proxyToPort;
//  6 seconds , but you can set any time you want
const MaxEC2MinutesIdleTime = args.maxEc2Idle;
const maxEC2IdleTimeMs = 60000 * MaxEC2MinutesIdleTime;
console.log(`Process pid ${process.pid}`);
let turnoff;
proxy.createProxy(ProxyPort, ProxyToURL, ProxyToPort, {
  upstream: async function (context, data) {
    // Check if AWS EC2 is not up
    if (!isUp) {
      isUp = true;
      console.log("Turning EC2 on...");
      // Input your CLI Script to awake your EC2 here
      await ec2Client.send(new StartInstancesCommand(paramsStart));
      // console.log("Success", data.StartingInstances);
      const date = new Date();
      // Check if intance is alreadyUp
      let instanceStatus;
      while (instanceStatus != "running") {
        const data = await ec2Client.send(
          new DescribeInstancesCommand(paramsStart)
        );
        console.log({ data });
        const [firstReservation] = data.Reservations;
        if (firstReservation) {
          const [firstInstance] = firstReservation.Instances;
          if (firstInstance) instanceStatus = firstInstance.State.Name;
        }

        // sleep 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const date2 = new Date();
      console.log(`Turn EC2 on took : ${date2.getTime() - date.getTime()}ms`);
    }
    // erase old EC2 idle live timer
    if (turnoff) {
      clearTimeout(turnoff);
    }
    // create new EC2 idle live timer
    turnoff = setTimeout(async () => {
      // once EC2 Max idle time is done , turn off instance
      console.log("Server max idle time has passed.");
      console.log("Turning EC2 off...");
      await ec2Client.send(new StopInstancesCommand(paramsStop));
      // console.log("Success", data.StoppingInstances);
      isUp = false;
    }, maxEC2IdleTimeMs);

    return data;
  },
});
