import boto3

client = boto3.client('iot')


def handler(event, context):
    print(event)
    '''
    client.update_thing(
        thingName=event['thingName'],
        attributePayload={
            'attributes': {
                'debug': bool(event['debug'])
            }
        }
    )
    '''