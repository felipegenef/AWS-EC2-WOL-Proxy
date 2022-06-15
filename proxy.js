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
      await new Promise((resolve) => setTimeout(resolve, 28000));
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
// context type
// {
//   buffers: [],
//   connected: false,{
//   buffers: [],
//   connected: false,
//   proxySocket: <ref *1> Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: [],
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: false,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       destroyed: false,
//       errored: null,
//       closed: false,
//       closeEmitted: false,
//       defaultEncoding: 'utf8',
//       awaitDrainWriters: null,
//       multiAwaitDrain: false,
//       readingMore: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     _events: [Object: null prototype] {
//       end: [Function: onReadableStreamEnd],
//       data: [Function (anonymous)],
//       close: [Function (anonymous)],
//       error: [Function (anonymous)]
//     },
//     _eventsCount: 4,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       buffered: [],
//       bufferedIndex: 0,
//       allBuffers: true,
//       allNoop: true,
//       pendingcb: 0,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       errored: null,
//       closed: false,
//       closeEmitted: false
//     },
//     allowHalfOpen: false,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: false,
//       pauseOnConnect: false,
//       _connectionKey: '6::::8080',
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 5
//     },
//     _server: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: false,
//       pauseOnConnect: false,
//       _connectionKey: '6::::8080',
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 5
//     },
//     _peername: { address: '::ffff:127.0.0.1', family: 'IPv6', port: 39246 },
//     [Symbol(async_id_symbol)]: 7,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       [Symbol(owner_symbol)]: [Circular *1]
//     },
//     [Symbol(kSetNoDelay)]: false,
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: null,
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   }
// }
//   proxySocket: <ref *1> Socket {
//     connecting: false,
//     _hadError: false,
//     _parent: null,
//     _host: null,
//     _readableState: ReadableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       buffer: BufferList { head: null, tail: null, length: 0 },
//       length: 0,
//       pipes: [],
//       flowing: true,
//       ended: false,
//       endEmitted: false,
//       reading: false,
//       sync: false,
//       needReadable: true,
//       emittedReadable: false,
//       readableListening: false,
//       resumeScheduled: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       destroyed: false,
//       errored: null,
//       closed: false,
//       closeEmitted: false,
//       defaultEncoding: 'utf8',
//       awaitDrainWriters: null,
//       multiAwaitDrain: false,
//       readingMore: false,
//       decoder: null,
//       encoding: null,
//       [Symbol(kPaused)]: false
//     },
//     _events: [Object: null prototype] {
//       end: [Function: onReadableStreamEnd],
//       data: [Function (anonymous)],
//       close: [Function (anonymous)],
//       error: [Function (anonymous)]
//     },
//     _eventsCount: 4,
//     _maxListeners: undefined,
//     _writableState: WritableState {
//       objectMode: false,
//       highWaterMark: 16384,
//       finalCalled: false,
//       needDrain: false,
//       ending: false,
//       ended: false,
//       finished: false,
//       destroyed: false,
//       decodeStrings: false,
//       defaultEncoding: 'utf8',
//       length: 0,
//       writing: false,
//       corked: 0,
//       sync: true,
//       bufferProcessing: false,
//       onwrite: [Function: bound onwrite],
//       writecb: null,
//       writelen: 0,
//       afterWriteTickInfo: null,
//       buffered: [],
//       bufferedIndex: 0,
//       allBuffers: true,
//       allNoop: true,
//       pendingcb: 0,
//       prefinished: false,
//       errorEmitted: false,
//       emitClose: false,
//       autoDestroy: false,
//       errored: null,
//       closed: false,
//       closeEmitted: false
//     },
//     allowHalfOpen: false,
//     _sockname: null,
//     _pendingData: null,
//     _pendingEncoding: '',
//     server: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: false,
//       pauseOnConnect: false,
//       _connectionKey: '6::::8080',
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 5
//     },
//     _server: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       _connections: 1,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       allowHalfOpen: false,
//       pauseOnConnect: false,
//       _connectionKey: '6::::8080',
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 5
//     },
//     _peername: { address: '::ffff:127.0.0.1', family: 'IPv6', port: 39246 },
//     [Symbol(async_id_symbol)]: 7,
//     [Symbol(kHandle)]: TCP {
//       reading: true,
//       onconnection: null,
//       [Symbol(owner_symbol)]: [Circular *1]
//     },
//     [Symbol(kSetNoDelay)]: false,
//     [Symbol(lastWriteQueueSize)]: 0,
//     [Symbol(timeout)]: null,
//     [Symbol(kBuffer)]: null,
//     [Symbol(kBufferCb)]: null,
//     [Symbol(kBufferGen)]: null,
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesRead)]: 0,
//     [Symbol(kBytesWritten)]: 0
//   }
// }
