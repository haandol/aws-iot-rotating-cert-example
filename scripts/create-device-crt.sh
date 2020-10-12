#!/bin/sh

print_usage() {
  echo "Usage: $0 <THING_NAME>"
  exit 2
}

if [ -n "$1" ];
then THING_NAME=$1
else
  print_usage
fi

pushd .
cd certs

openssl genrsa -out device.key 2048
openssl req -new -key device.key -out device.csr -subj "/C=KR/CN=${THING_NAME}"
openssl x509 -req -in device.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out device.crt -days 500 -sha256
cat device.crt rootCA.pem > deviceAndRootCA.crt

popd

mkdir -p src/certs
mv certs/device* src/certs
cp certs/AmazonRootCA1.pem src/certs/
