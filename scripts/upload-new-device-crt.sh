#!/bin/sh

print_usage() {
  echo "Usage: $0 <S3_BUCKET_NAME>"
  exit 2
}

if [ -n "$1" ];
then
    S3_BUCKET_NAME=$1
else
  print_usage
fi

pushd .
cd certs

aws s3 cp new-device-crt.tar.gz s3://$S3_BUCKET_NAME/

popd