
require("dotenv").config();

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION || "us-east-1"
});

const ec2 = new AWS.EC2();
const ssm = new AWS.SSM();


const INSTANCE_TYPE = "t3.micro";

const KEY_NAME = "music-key";

const SECURITY_GROUP_NAME =
    "music-backend-sg";


async function createEC2() {

    try {


        const amiData =
            await ssm.getParameter({

                Name:
"/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"

            }).promise();

        const AMI_ID =
            amiData.Parameter.Value;

        console.log(
            "Using Ubuntu AMI:",
            AMI_ID
        );


        const sgData =
            await ec2.describeSecurityGroups({

                Filters: [
                    {
                        Name: "group-name",

                        Values: [
                            SECURITY_GROUP_NAME
                        ]
                    }
                ]

            }).promise();

        if (
            sgData.SecurityGroups.length === 0
        ) {

            console.log(
                "Security group not found:",
                SECURITY_GROUP_NAME
            );

            return;
        }

        const securityGroupId =
            sgData.SecurityGroups[0].GroupId;

        console.log(
            "Using Security Group:",
            securityGroupId
        );


        const userDataScript = `#!/bin/bash

apt update -y

apt install -y curl unzip

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

apt install -y nodejs

npm install -g pm2
`;

        const userData =
            Buffer.from(
                userDataScript
            ).toString("base64");

      

        const result =
            await ec2.runInstances({

                ImageId: AMI_ID,

                InstanceType:
                    INSTANCE_TYPE,

                KeyName: KEY_NAME,

                MinCount: 1,

                MaxCount: 1,

                NetworkInterfaces: [
                    {
                        DeviceIndex: 0,

                        AssociatePublicIpAddress: true,

                        Groups: [
                            securityGroupId
                        ]
                    }
                ],

                BlockDeviceMappings: [
                    {
                        DeviceName:
                            "/dev/sda1",

                        Ebs: {

                            VolumeSize: 20,

                            VolumeType: "gp3",

                            DeleteOnTermination:
                                true
                        }
                    }
                ],

                UserData: userData,

                TagSpecifications: [
                    {
                        ResourceType:
                            "instance",

                        Tags: [
                            {
                                Key: "Name",

                                Value:
                                "music-backend-ec2"
                            }
                        ]
                    }
                ]

            }).promise();

        const instanceId =
            result.Instances[0].InstanceId;

        console.log(
            "\nEC2 instance created:",
            instanceId
        );

        console.log(
            "Waiting for instance to run..."
        );


        await ec2.waitFor(

            "instanceRunning",

            {
                InstanceIds: [
                    instanceId
                ]
            }

        ).promise();


        const instanceData =
            await ec2.describeInstances({

                InstanceIds: [
                    instanceId
                ]

            }).promise();

        const instance =
            instanceData.Reservations[0]
            .Instances[0];


        console.log(
            "\nEC2 is ready!"
        );

        console.log(
            "Instance ID:",
            instanceId
        );

        console.log(
            "Public IP:",
            instance.PublicIpAddress
        );

        console.log(
            "Public DNS:",
            instance.PublicDnsName
        );

        console.log(
            "\nSSH command:"
        );

        console.log(
`ssh -i music-key.pem ubuntu@${instance.PublicIpAddress}`
        );

    } catch (err) {

        console.error(
            "Error creating EC2:"
        );

        console.error(err);
    }
}


createEC2();