# Rotating Certification using AWS IoT Job

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

# Provision Device to AWS IoT

## Creating device certificate

```bash
$ ./scripts/create-device-crt.sh
```

## Get ThingName

JIT(just-in-time) Provisioning process sets thing's id to its certificate id by default. 

The certificate id is generated using signature of certificate.

```bash
$ export THING_NAME=$(openssl x509 -noout -fingerprint -sha256 -in ./src/certs/deviceAndRootCA.crt | cut -f2 -d '=' | sed 's/://g' | awk '{print tolower($0)}')

$ echo $THING_NAME
596143567205b76dffc74843d37b2c7c46908ec809c1f472c24382ab6b113822
```

## Connect to Device

install dependencies

```bash
$ cd src
$ npm i
```

run device app

```bash
$ export DATA_ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS | jq -r '.endpointAddress')
$ node app.js -e $DATA_ENDPOINT -n $THING_NAME -c clientID1

connect
```