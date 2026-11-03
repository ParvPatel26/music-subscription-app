require("dotenv").config();

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const ec2 = new AWS.EC2();

const SECURITY_GROUP_NAME =
    "music-backend-sg";

async function createSecurityGroup() {

    try {

        const vpcs =
            await ec2.describeVpcs({

                Filters: [
                    {
                        Name: "isDefault",
                        Values: ["true"]
                    }
                ]

            }).promise();

        const vpcId =
            vpcs.Vpcs[0].VpcId;

        console.log(
            "Using VPC:",
            vpcId
        );

        const existing =
            await ec2.describeSecurityGroups({

                Filters: [
                    {
                        Name: "group-name",
                        Values: [SECURITY_GROUP_NAME]
                    }
                ]

            }).promise();

        if (
            existing.SecurityGroups.length > 0
        ) {

            console.log(
                "Security group already exists"
            );

            console.log(
                existing.SecurityGroups[0].GroupId
            );

            return;
        }

        const sg =
            await ec2.createSecurityGroup({

                GroupName:
                    SECURITY_GROUP_NAME,

                Description:
                    "Music backend security group",

                VpcId: vpcId

            }).promise();

        const securityGroupId =
            sg.GroupId;

        console.log(
            "Security Group Created:",
            securityGroupId
        );

        await ec2.authorizeSecurityGroupIngress({

            GroupId:
                securityGroupId,

            IpPermissions: [
                {
                    IpProtocol: "tcp",

                    FromPort: 22,

                    ToPort: 22,

                    IpRanges: [
                        {
                            CidrIp:
                                "0.0.0.0/0"
                        }
                    ]
                },
                {
                    IpProtocol: "tcp",

                    FromPort: 80,

                    ToPort: 80,

                    IpRanges: [
                        {
                            CidrIp:
                                "0.0.0.0/0"
                        }
                    ]
                },
                {
                    IpProtocol: "tcp",

                    FromPort: 443,

                    ToPort: 443,

                    IpRanges: [
                        {
                            CidrIp:
                                "0.0.0.0/0"
                        }
                    ]
                },

                {
                    IpProtocol: "tcp",

                    FromPort: 5000,

                    ToPort: 5000,

                    IpRanges: [
                        {
                            CidrIp:
                                "0.0.0.0/0"
                        }
                    ]
                }
            ]

        }).promise();

        console.log(
            "Inbound rules added"
        );

    } catch (err) {

        console.error(err);
    }
}

createSecurityGroup();