const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const ec2Client = new EC2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});
async function main() {
  const data = await ec2Client.send(
    new DescribeInstancesCommand({ InstanceIds: ["INSTANCE_ID"] })
  );
  console.log("Success", JSON.stringify(data));
}
main();
