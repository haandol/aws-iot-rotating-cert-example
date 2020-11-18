#!/bin/sh

print_usage() {
  echo "Usage: $0 <ROLE_ARN> <THING_TYPE_NAME> <PROFILE>"
  exit 2
}

if [ -n "$3" ];
then
  ROLE_ARN=$1
  THING_TYPE_NAME=$2
  PROFILE=$3
else
  print_usage
fi

cp ./jitp/base-template.json ./certs/provisioning-template.json
sed -i '' -e "s|<ROLE_ARN>|${ROLE_ARN}|g" ./certs/provisioning-template.json
sed -i '' -e "s|<THING_TYPE_NAME>|${THING_TYPE_NAME}|g" ./certs/provisioning-template.json
aws iot create-thing-type --thing-type-name $THING_TYPE_NAME --profile $PROFILE
