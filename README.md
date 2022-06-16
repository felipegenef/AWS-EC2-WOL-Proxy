# AWS-EC2-WOL-Proxy

This template demonstrates how to make a simple Wake on Lan proxy for AWS EC2 databases or Apps. It makes a waiting pool of connections while turns EC2 on. After the connection is done it redirect all TCPs to the EC2.
The idea here is to make something similar to a Serverless database/application where you pay only for the uptime of the EC2.

## Usage

- Clone/fork this package;
- Give it a star 😆🧐;
- customize this script on the turn on/off EC2s.
  <img src="/assets/uncomment1.png" />
  <img src="/assets/uncomment2.png" />
  <img src="/assets/uncomment3.png" />
- run your proxy and test it!

##### Args

- **"--proxyPort"** : port that the proxy server will be listening to (default is 8080);
- **"--proxyToPort"** : port that the proxy server will redirect to (default is 3000);
- **"--proxyToIp"** : ip that the proxy server will redirect to (default is localhost);
- **"--maxEc2Idle"** : max idle time (in minutes) allowed from proxy before shutting down EC2. You can pass float numbers values.(default is 0.1 witch is 6 seconds for testing purposes);

## Testing locally

#### Run the proxy server

With this command you are proxing all connections from localhost:8080 to localhost:3000

```bash
npm run start
```

#### Or run the proxy server with clusters

With this command you are proxing all connections from localhost:8080 to localhost:3000 loadbalancing between clusters

```bash
npm run start:cluster
```

#### Run the docker-compose file to create a mongo database at 27017

```bash
docker-compose up -d
```

#### Test your proxy on MongoDb connection

```bash
npm run test:Db
```

This script will try to connect to a mongo url at localhost:8080 , but your proxy will hold for a few seconds before starts inserting data. This happens because your proxy will be holding requests while turning your EC2 up before redirecting.

If you stop your activitiy of insertions for 6 seconds the proxy will understand that your EC2 needs to be shut down.

##### For ExpressAPI proxy testing

```bash
npm run http
```

```bash
npm run test
```

### Deployment

We recommend using this proxy with [pm2](https://www.npmjs.com/package/pm2) for poduction.
