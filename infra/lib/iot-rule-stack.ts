import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iot from '@aws-cdk/aws-iot';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';

export class IotRuleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, 'UpdateThingFunction', {
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'functions')),
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'update_thing.handler',
    });
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'iot:*',
        'logs:*',
      ],
      effect: iam.Effect.ALLOW,
      resources: ['*'],
    }));
    const debugBucket = new s3.Bucket(this, `DebugBucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const prodBucket = new s3.Bucket(this, `ProdBucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const updateThingRule = new iot.CfnTopicRule(this, 'UpdateThingRule', {
      topicRulePayload: {
        actions: [
          {
            lambda: {
              functionArn: fn.functionArn,
            }
          },
        ],
        ruleDisabled: false,
        sql: "SELECT * FROM 'iot/update/thing/+'",
        awsIotSqlVersion: '2016-03-23',
      },
      ruleName: 'UpdateThing',
    });

    const iotS3Role = new iam.Role(this, 'IoTS3Role', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
    });
    debugBucket.grantPut(iotS3Role)
    prodBucket.grantPut(iotS3Role);

    new iot.CfnTopicRule(this, 'DebugLog', {
      topicRulePayload: {
        actions: [
          {
            s3: {
              bucketName: debugBucket.bucketName,
              key: '${topic(3)}/${timestamp()}',
              roleArn: iotS3Role.roleArn,
            }
          },
        ],
        ruleDisabled: false,
        sql: "SELECT * FROM 'iot/thing/+/heartbeat' WHERE debug = true",
        awsIotSqlVersion: '2016-03-23',
      },
      ruleName: 'DebugLog',
    });

    new iot.CfnTopicRule(this, 'ProdLog', {
      topicRulePayload: {
        actions: [
          {
            s3: {
              bucketName: prodBucket.bucketName,
              key: '${topic(3)}/${timestamp()}',
              roleArn: iotS3Role.roleArn,
            }
          },
        ],
        ruleDisabled: false,
        sql: "SELECT * FROM 'iot/thing/+/heartbeat' WHERE debug = false",
        awsIotSqlVersion: '2016-03-23',
      },
      ruleName: 'ProdLog',
    });

  }

}