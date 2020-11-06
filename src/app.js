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
  .option('c', {
    alias: 'clientId',
    type: 'string',
    description: 'client id',
    demandOption: true,
  })
  .argv;

class Device {
  constructor(argv) {
    this.clientId = argv.clientId;

    this.device = awsIot.device({
      keyPath: path.resolve(__dirname, 'certs', 'device.key'),
      certPath: path.resolve(__dirname, 'certs', 'deviceAndRootCA.crt'),
      caPath: path.resolve(__dirname, 'certs', 'AmazonRootCA1.pem'),
      clientId: argv.clientId,
      host: argv.endpoint,
    });

    this.hbInteveral = null;

    this.device.on('connect', () => {
      console.log('[Device]connect');
    });

    this.device.on('disconnect', () => {
      console.log('[Device] disconnect');
      clearInterval(this.hbInteveral);
      this.hbInteveral = null;
    })

    this.device.on('message', (topic, payload) => {
      console.log(`[Device] message: ${topic}-${payload.toString()}`);
    });
  }

  publish(topic, msg) {
    console.info(`[Device] publish msg to [${topic}]: ${msg}`);
    this.device.publish(topic, msg);
  }

  heartbeat() {
    this.hbInteveral = setInterval(() => {
      const topic = `heartbeat/${argv.clientId}`;
      const msg = JSON.stringify({
        clientId: this.clientId,
        timestamp: +new Date(),
      });
      this.publish(topic, msg);
    }, 5 * 1000);
  }
}

const device = new Device(argv);
device.heartbeat();
device.publish(`iot/update/thing/${device.clientId}`, JSON.stringify({debug: true}));
