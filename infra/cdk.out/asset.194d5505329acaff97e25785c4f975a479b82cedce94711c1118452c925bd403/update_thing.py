import boto3

client = boto3.client('iot')


def handler(event, context):
    client.update_thing(
        thingName=event['thingName'],
        attributePayload={
            'attributes': event['attributes'],
            'merge': False,
        },
    )