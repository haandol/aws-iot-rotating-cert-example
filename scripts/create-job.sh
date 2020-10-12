#!/bin/sh

print_usage() {
  echo "Usage: $0 <JOB_ID> <ROLE_ARN> <TARGET_DEVICE_ARN>"
  exit 2
}

if [ -n "$3" ];
then
    JOB_ID=$1
    ROLE_ARN=$2
    TARGET=$3
else
  print_usage
fi

pushd .
cd jobs

aws iot create-job \
    --job-id $JOB_ID \
    --targets $TARGET \
    --document file://rotating-crt-job.json \
    --timeout-config inProgressTimeoutInMinutes=100 \
    --description "Rotating certificate job" \
    --target-selection SNAPSHOT \
    --presigned-url-config "{\"roleArn\":\"$ROLE_ARN\", \"expiresInSec\":3600}"

popd