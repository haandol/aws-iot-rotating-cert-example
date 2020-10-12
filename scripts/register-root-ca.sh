#!/bin/sh

pushd .
cd certs

aws iot register-ca-certificate --ca-certificate file://rootCA.pem --verification-cert file://verification.pem --set-as-active --allow-auto-registration --registration-config file://provisioning-template.json

popd