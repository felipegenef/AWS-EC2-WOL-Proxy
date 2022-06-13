# AWS-EC2-WOL-Proxy

This template demonstrates how to make a simple Wake on Lan proxy for AWS EC2 databases. It makes a waiting pool of connections while turns EC2 on with AWS CLI. After the connection is done it redirect all TCPs to the EC2.
The idea here is to make something similar to a Serverless database where you pay only for the uptime of the EC2.

## Usage

#### Run the docker-compose file to simulate a mongo database at 27017

```bash
docker-compose up -d
```

#### Run the express server to simulate AWS response time of 28 secots to set the EC2 up

```bash
node handler.js
```

#### Run the proxy server

With this command you are proxing all connections from localhost:27017 to localhost:8080

```bash
node proxy.js
```

#### Test your proxy

This script will try to connect to a mongo url at localhost:8080 , but your proxy will hold for 28 seconds before starts inserting data. This happens because your proxy will make an http request simulating your attempt to turn aws EC2 on with AWS CLI. Once the EC2 is up, after 28 seconds it will redirect to your DB and will make A LOT of insertions.

If you stop your activitiy of insertions for 3000 ms the proxy will understand that your EC2 needs to be shut down and will "make the command" (you need to do it with your AWS CLI).

```bash
node query.js
```

### Deployment
