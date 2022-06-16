var proxy = require("node-tcp-proxy");
const { EC2Client } = require("@aws-sdk/client-ec2");
// Set the AWS Region.
// const REGION = "REGION"; //e.g. "us-east-1"
// Create anAmazon EC2 service client object.
// const ec2Client = new EC2Client({ region: REGION });
// const paramsStart = { InstanceIds: ["INSTANCE_ID"] }; // Array of INSTANCE_IDs
// const paramsStop = { InstanceIds: ["INSTANCE_ID"],hibernate:true }; // Array of INSTANCE_IDs
let isUp = false;
const ProxyPort = 8080;
const DBURL = "localhost";
const DBPORT = 3000;
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
      await axios.get("/turnEC2");
      // Input your CLI Script to awake your EC2 here
      // const data = await ec2Client.send(new StartInstancesCommand(paramsStart));
      // console.log("Success", data.StartingInstances);
      const date = new Date();
      // Check if intance is alreadyUp
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
      isUp = false;
    }, maxEC2IdleTimeMs);

    return data;
  },
});
