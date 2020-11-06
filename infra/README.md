# IoT Rule

This repository deploys below architecture

![Architecture](img/selective.png)

# Prerequisites

- git
- awscli
- Nodejs 10.x+
- Python3.4+
- Docker 19.x+
- AWS Account and locally configured AWS credential

# Installation

## Install dependencies

```bash
$ cd infra
$ npm i -g typescript
$ npm i -g cdk
$ npm i
```

## Deploy service

```bash
$ cdk bootstrap
$ cdk deploy "*" --require-approval never
```

# Usage

## Enable to subscribe update device topic, you should enable specific topic

```bash
$ aws iot update-event-configurations --event-configurations "{\"THING\":{\"Enabled\": true}}"
```

## Run app.js

```bash
$ node app.js -e $DATA_ENDPOINT -c clientID1 -n $THING_NAME
[Device]connect
subscribe thing update
publish thing update
[Device] message: $aws/events/thing/thing01/updated-{"eventType":"THING_EVENT","eventId":"0b0f0da79f094fe57552659749a0590f","timestamp":1604663926577,"operation":"UPDATED","accountId":"929831892372","thingId":"045d911a-4e37-4a49-afec-a79a507483d3","thingName":"thing01","versionNumber":55,"thingTypeName":null,"billinGroupName":null,"attributes":{"debug":"false"}}
false
[Device] publish msg to [iot/thing/clientID1/heartbeat]: {"clientId":"clientID1","debug":"false","timestamp":1604663929739}
```

## Checkout Logs

visit [**S3 Bucket**]

# Cleanup

```bash
$ cdk destroy "*"
```