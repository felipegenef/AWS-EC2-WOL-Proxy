const totalItems = 1000 * 1000;
let doneItems = 0;
const mongoose = require("mongoose");
const cliProgress = require("cli-progress");
const bar = new cliProgress.SingleBar({
  format: "Progress |" + "{bar}" + "| {percentage}% || {value}/{total}",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: false,
});
async function main() {
  try {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.ObjectId;

    const counterModel = new Schema({
      author: ObjectId,
      title: String,
    });

    bar.start(totalItems, 0);

    await mongoose.connect(
      "mongodb://citizix:S3cret@localhost:8080/?authMechanism=DEFAULT",
      {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        waitQueueTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
      }
    );
    for (let index = 0; index < totalItems; index++) {
      const counter = mongoose.model("counterModel", counterModel);
      await counter.create({ title: `${index} criado com sucesso` });
      doneItems++;

      bar.update(doneItems);
    }
  } catch (error) {
    console.error(error);
  }
  process.exit();
}
main();
