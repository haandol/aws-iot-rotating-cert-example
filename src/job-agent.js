const path = require('path');
const awsIot = require('aws-iot-device-sdk');
const yargs = require('yargs');
const exec = require('child_process').execSync;

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

class Jobs {
  constructor(argv) {
    this.clientId = argv.clientId;
    this.thingName = argv.thingName;

    this.jobs = awsIot.jobs({
      keyPath: path.resolve(__dirname, 'certs', 'device.key'),
      certPath: path.resolve(__dirname, 'certs', 'deviceAndRootCA.crt'),
      caPath: path.resolve(__dirname, 'certs', 'AmazonRootCA1.pem'),
      clientId: `${argv.clientId}`,
      host: argv.endpoint,
    });

    this.jobs.on('connect', () => {
      console.log('[Job] connect');
    });

    this.jobs.on('message', (topic, payload) => {
      console.log(`[Job] message: ${topic}-${payload.toString()}`);
    });

    this.jobs.subscribeToJobs(this.thingName, (err, job) => {
      if(!err) {
        console.log(`[Job] default job handler invoked, jobId: ${job.id.toString()}`);
      } else {
        console.error(err);
      }
    });

    this.jobs.subscribeToJobs(this.thingName, 'rotate-crt', async (err, job) => {
      if(!err) {
        console.log(`[Job] Rotating certificate job handler invoked, jobId: ${job.id.toString()}`);
        console.log(`[Job] Rotating certificate job document: ${JSON.stringify(job.document)}`);

        const fileName = 'device-crt.tar.gz';
        const { url } = job.document.files;

        let execResponse;
        execResponse = await exec(`curl "${url}" -o "${fileName}"`);
        if (execResponse.stderr) {
          console.error(`error: ${execResponse.stderr}`);
          return;
        } else {
          console.log(execResponse.stdout);
          job.succeeded({ step: 'download certs' }, () => {
            console.log('download cert files successfully...');
          });
        }

        execResponse = await exec(`tar zxvf "${fileName}" -C src/certs`);
        if (execResponse.stderr) {
          console.error(`error: ${execResponse.stderr}`);
          return;
        } else {
          console.log(execResponse.stdout);
          job.succeeded({ step: 'rotate cert files' }, () => {
            console.log('replace cert files successfully...');
          });
        }
      } else {
        console.error(err);
      }
    });

    this.jobs.startJobNotifications(this.thingName, (err) => {
      if(!err) {
        console.log(`job notifications initiated for thing: ${this.thingName}`);
      }
      else {
        console.error(err);
      }
    });
  }
}

const jobs = new Jobs(argv);