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
      "--ec2ids": String,
    },
    { argv: rawArgs.slice(2) }
  );
  return {
    proxyPort: args["--proxyPort"] || 8080,
    proxyToIp: args["--proxyToIp"] || "localhost",
    proxyToPort: args["--proxyToPort"] || 3001,
    maxEc2Idle: args["--maxEc2Idle"] || 0.1,
    ec2ids: args["--ec2ids"] || "",
  };
}
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
const paramsStart = { InstanceIds: args.ec2ids.split(",") }; // Array of INSTANCE_IDs
const paramsStop = { InstanceIds: args.ec2ids.split(","), hibernate: true }; // Array of INSTANCE_IDs
let isUp = false;
const ProxyPort = args.proxyPort;
const ProxyToURL = args.proxyToIp;
const ProxyToPort = args.proxyToPort;
//  6 seconds , but you can set any time you want
const MaxEC2MinutesIdleTime = args.maxEc2Idle;
const maxEC2IdleTimeMs = 60000 * MaxEC2MinutesIdleTime;
console.log(
  `[${new Date().toISOString()}] Process pid ${
    process.pid
  } is running tcp proxy from localhost:${ProxyPort} to ${ProxyToURL}:${ProxyToPort}`
);
let turnoff;
proxy.createProxy(ProxyPort, ProxyToURL, ProxyToPort, {
  upstream: async function (context, data) {
    // Check if AWS EC2 is not up
    if (!isUp) {
      isUp = true;
      let instanceStatus;
      console.log(`[${new Date().toISOString()}] ` + "Turning EC2 on...");
      // check if EC2 is not on stopping status
      // while (instanceStatus.toUpperCase() != "stopped".toUpperCase()) {
      //   const data = await ec2Client.send(
      //     new DescribeInstancesCommand(paramsStart)
      //   );
      //   const [firstReservation] = data.Reservations;
      //   if (firstReservation) {
      //     const [firstInstance] = firstReservation.Instances;
      //     if (firstInstance) instanceStatus = firstInstance.State.Name;
      //   }
      //   // sleep 1 second
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      // }
      // await ec2Client.send(new StartInstancesCommand(paramsStart));
      // console.log("Success", data.StartingInstances);
      const date = new Date();
      // Check if intance is alreadyUp

      // while (instanceStatus.toUpperCase() != "running".toUpperCase()) {
      //   const data = await ec2Client.send(
      //     new DescribeInstancesCommand(paramsStart)
      //   );
      //   const [firstReservation] = data.Reservations;
      //   if (firstReservation) {
      //     const [firstInstance] = firstReservation.Instances;
      //     if (firstInstance) instanceStatus = firstInstance.State.Name;
      //   }

      //   // sleep 1 second
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      // }
      await new Promise((resolve) => setTimeout(resolve, 20000));
      const date2 = new Date();
      console.log(
        `[${new Date().toISOString()}] Turn EC2 on took : ${
          date2.getTime() - date.getTime()
        }ms`
      );
    }
    // erase old EC2 idle live timer
    if (turnoff) {
      clearTimeout(turnoff);
    }
    // create new EC2 idle live timer
    turnoff = setTimeout(async () => {
      // once EC2 Max idle time is done , turn off instance
      console.log(
        `[${new Date().toISOString()}] ` + "Server max idle time has passed."
      );
      console.log(`[${new Date().toISOString()}] ` + "Turning EC2 off...");
      // await ec2Client.send(new StopInstancesCommand(paramsStop));
      // console.log("Success", data.StoppingInstances);
      isUp = false;
    }, maxEC2IdleTimeMs);

    return data;
  },
});
