const path = require('path');
const awsIot = require('aws-iot-device-sdk');
const yargs = require('yargs');

const argv = yargs.usage('Usage: $0 [options]')
                  .demandOption(['e', 'c'])
                  .alias('e', 'endpoint').describe('e', 'device endpoint')
                  .alias('c', 'clientId').describe('c', 'client id')
                  .argv;

var device = awsIot.device({
  keyPath: path.resolve(__dirname, 'certs', 'device.key'),
  certPath: path.resolve(__dirname, 'certs', 'deviceAndRootCA.crt'),
  caPath: path.resolve(__dirname, 'certs', 'AmazonRootCA1.pem'),
  clientId: argv.clientId,
  host: argv.endpoint,
});

device.on('connect', () => {
  console.log('connect');
});

device.on('disconnect', () => {
  console.log('disconnect');
})

device.on('message', (topic, payload) => {
  console.log(`message: ${topic}-${payload.toString()}`);
});
