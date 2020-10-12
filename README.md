# Rotating Certification using AWS IoT Job

1. Register RooCA to AWS IoT
2. Create device certificate
3. Provision device by running job agent
4. Create rotating device certificate
5. Create job
6. Restart job agent (or restart device)

# Register RootCA to AWS IoT

## Create RootCA

```bash
$ ./scripts/create-rootca.sh
```

### Create private key verification certificate

```bash
$ ./scripts/create-verification-crt.sh
```

### Register RootCA using verification certification

create IAM Role ref https://aws.amazon.com/ko/blogs/iot/setting-up-just-in-time-provisioning-with-aws-iot-core/

```bash
$ ./scripts/create-jitp-template.sh arn:aws:iam::929831892372:role/JITPRole
$ ./scripts/register-root-ca.sh
```

# Create device certificate

## Creating device certificate

```bash
export THING_NAME=thing01
$ ./scripts/create-device-crt.sh $THING_NAME
```

# Provision Device to AWS IoT

## Connect to Device

install dependencies

```bash
$ cd src
$ npm i
```

## Run job agent to provision device

```bash
$ export DATA_ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS | jq -r '.endpointAddress')
$ node job-agent.js -e $DATA_ENDPOINT -n $THING_NAME -c clientID1

[Job] connect
[Job] notifications initiated for thing: 596143567205b76dffc74843d37b2c7c46908ec809c1f472c24382ab6b113822
```

# Create device rotating certificate 

create device certificate to be rotated with new name

> if you use same old name for the rotating certificate, you should remove old thing from AWS IoT Console after register it.
> or status of certificate will be stuck in **STATUS.PENDINGACTIVATION**

```bash
$ ./scripts/create-new-device-crt.sh new-thing01
```

upload certificates to S3 bucket

```bash
$ export BUCKET_NAME=dongkyl-iot-test
$ ./scripts/upload-new-device-crt.sh $BUCKET_NAME
```

# Create job

Create IAM role for generate pre-signed url for certificate file

```bash
$ ./scripts/create-job.sh
Usage: ./scripts/create-job.sh <JOB_ID> <ROLE_ARN> <TARGET_DEVICE_ARN>

$ ./scripts/create-job.sh \
  job01 \
  arn:aws:iam::929831892372:role/service-role/IoTCopyJobRole \
  arn:aws:iot:ap-northeast-2:929831892372:thing/thing01
```

# Restart job agent

stop job agent and restart it with new thing name

```bash
$ node src/job-agent.js -e $DATA_ENDPOINT -c clientID02 -n new-thing01
[Job] connect
[Job] notifications initiated for thing: new-thing01
```

now you can remove old *thing01* from AWS IoT