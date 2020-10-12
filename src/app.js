const path = require('path');
const awsIot = require('aws-iot-device-sdk');
const yargs = require('yargs');

const argv = yargs.command('*', false, (yargs) => {
  yargs
  .usage('Usage: $0 [options]')
  .option('endpoint', {
    alias: 'e',
    type: 'string',
    description: 'device endpoint',
    required: true,
  })
  .option('clientId', {
    alias: 'c',
    type: 'string',
    description: 'client id',
    required: true,
  })
}).parse();

const device = awsIot.device({
  keyPath: path.resolve(__dirname, 'certs', 'device.key'),
  certPath: path.resolve(__dirname, 'certs', 'deviceAndRootCA.crt'),
  caPath: path.resolve(__dirname, 'certs', 'AmazonRootCA1.pem'),
  clientId: argv.clientId,
  host: argv.endpoint,
});

const hbInteveral = setInterval(() => {
  const topic = `heartbeat/${argv.clientId}`;
  const msg = JSON.stringify({
    clientId: argv.clientId,
    timestamp: +new Date(),
  });
  device.publish(topic, msg);
  console.info(`publish heartbeat: ${topic}-${msg}`);
}, 5*1000);

device.on('connect', () => {
  console.log('connect');
});

device.on('disconnect', () => {
  console.log('disconnect');
  clearInterval(hbInteveral);
})

device.on('message', (topic, payload) => {
  console.log(`message: ${topic}-${payload.toString()}`);
});
