# AWS-EC2-WOL-Proxy

This template demonstrates how to make a simple Wake on Lan proxy for AWS EC2 databases or Apps. It makes a waiting pool of connections while turns EC2 on. After the connection is done it redirect all TCPs to the EC2.
The idea here is to make something similar to a Serverless database/application where you pay only for the uptime of the EC2.

## Usage

- Clone/fork this package;
- Give it a like 😆🧐;
- customize this script on the turn on/off EC2s.
  <img src="/assets/uncoment1.png" />
  <img src="/assets/uncoment2.png" />
  <img src="/assets/uncoment3.png" />
- run your proxy and test it!

```bash
npm run start
```

```bash
yarn test
```

#### Run the docker-compose file to simulate a mongo database at 27017

```bash
docker-compose up -d
```

#### Run the proxy server

With this command you are proxing all connections from localhost:27017 to localhost:8080

```bash
npm run start
```

#### Run the proxy server with clusters

With this command you are proxing all connections from localhost:27017 to localhost:8080 loadbalancing between clusters

```bash
npm run start:cluster
```

##### Args

- **"--proxyPort"** : port that the proxy server will be listening to (default is 8080);
- **"--proxyToPort"** : port that the proxy server will redirect to (default is 3000);
- **"--proxyToIp"** : ip that the proxy server will redirect to (default is localhost);
- **"--maxEc2Idle"** : max idle time (in minutes) allowed from proxy before shutting down EC2. You can pass float numbers values.(default is 0.1 witch is 6 seconds for testing purposes);

#### Test your proxy on MongoDb connection

```bash
yarn test:Db
```

This script will try to connect to a mongo url at localhost:8080 , but your proxy will hold for 28 seconds before starts inserting data. This happens because your proxy will make an http request simulating your attempt to turn aws EC2 on with AWS CLI. Once the EC2 is up, after a few seconds it will redirect to your DB and will make A LOT of insertions.

If you stop your activitiy of insertions for 3000 ms the proxy will understand that your EC2 needs to be shut down and will "make the command" (you need to customize your data).

##### For ExpressAPI proxy

```bash
node handler.js
```

```bash
yarn test
```

### Deployment

We recommend using this proxy with [pm2](https://www.npmjs.com/package/pm2) for poduction.
