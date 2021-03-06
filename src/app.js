const path = require('path');
const awsIot = require('aws-iot-device-sdk');
const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [options]')
  .option('e', {
    alias: 'endpoint',
    type: 'string',
    description: 'device endpoint',
    demandOption: true,
  })
  .option('n', {
    alias: 'thingName',
    type: 'string',
    description: 'thing name',
    demandOption: true,
  })
  .option('c', {
    alias: 'clientId',
    type: 'string',
    description: 'client id',
    demandOption: true,
  })
  .argv;

class Device {
  constructor(props) {
    this.thingName = props.thingName;
    this.clientId = props.clientId;

    this.device = awsIot.device({
      keyPath: path.resolve(__dirname, 'certs', 'device.key'),
      certPath: path.resolve(__dirname, 'certs', 'deviceAndRootCA.crt'),
      caPath: path.resolve(__dirname, 'certs', 'AmazonRootCA1.pem'),
      clientId: props.clientId,
      host: props.endpoint,
    });

    this.hbInteveral = null;

    this.device.on('connect', (msg) => {
      console.log('[Device]connect');

      console.log('subscribe thing update');
      this.subscribe(`$aws/events/thing/${this.thingName}/updated`);

      console.log('publish thing update');
      this.publish(`iot/update/thing/${this.thingName}`, JSON.stringify({
        thingName: device.thingName,
        attributes: {
          debug: 'false'
        }
      }));
    });

    this.device.on('disconnect', () => {
      console.log('[Device] disconnect');
      clearInterval(this.hbInteveral);
      this.hbInteveral = null;
    })

    this.device.on('message', (topic, message) => {
      console.log(`[Device] message: ${topic}-${message.toString()}`);
      if (topic === `$aws/events/thing/${this.thingName}/updated`) {
        const payload = JSON.parse(message);
        this.debug = payload.attributes.debug === "true";
        console.log(this.debug);
      }
    });
  }

  publish(topic, msg) {
    console.info(`[Device] publish msg to [${topic}]: ${msg}`);
    this.device.publish(topic, msg);
  }

  subscribe(topic, msg) {
    console.info(`[Device] subscribe [${topic}]`);
    this.device.subscribe(topic);
  }

  heartbeat() {
    this.hbInteveral = setInterval(() => {
      const topic = `iot/thing/${this.clientId}/heartbeat`;
      const msg = JSON.stringify({
        clientId: this.clientId,
        debug: this.debug,
        timestamp: +new Date(),
      });
      this.publish(topic, msg);
    }, 5 * 1000);
  }
}


const device = new Device(argv);
device.heartbeat();
