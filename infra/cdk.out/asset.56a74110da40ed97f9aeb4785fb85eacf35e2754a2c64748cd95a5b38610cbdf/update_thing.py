import json
import boto3

client = boto3.client('iot')


def handler(event, context):
    print(type(event), event)
    body = json.loads(event)
    client.update_thing(
        thingName=body['thingName'],
        attributePayload=body['attributes']
    )