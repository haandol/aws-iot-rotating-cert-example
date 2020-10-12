#!/bin/sh

pushd .
cd certs

openssl genrsa -out device.key 2048
REG_CODE=$(aws iot get-registration-code | jq -r '.registrationCode')
SUBJ="/C=KR/CN=$REG_CODE"
openssl req -new -key device.key -out device.csr -subj $SUBJ
openssl x509 -req -in device.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out device.crt -days 500 -sha256
cat device.crt rootCA.pem > deviceAndRootCA.crt

popd

mkdir -p src/certs
mv certs/device* src/certs
cp certs/AmazonRootCA1.pem src/certs/