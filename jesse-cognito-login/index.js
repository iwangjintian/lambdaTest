var AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    var requestBody = JSON.parse(event.body);
    var username = requestBody.username;
    var pwd = requestBody.password;

    console.log("username:" + username)
    console.log("pwd:" + pwd);
    console.log("userPoolid:" + process.env.userPoolId);
    console.log("clientid:" + process.env.userPoolId);

    AWS.config.region = process.env.region;

    var params = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        ClientId: process.env.clientId,
        UserPoolId: process.env.userPoolId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: pwd
        }
    };
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: process.env.region });
    cognitoidentityserviceprovider.adminInitiateAuth(params, function(err, data) {
    if (err) {
        console.log(err, err.stack);
        callback(err, data)
    } else {
        var response = {
            "statusCode": 200,
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify(data),
            "isBase64Encoded": false
        };
        console.log("Response:" + JSON.stringify(response));
        callback(null, response)
    }
    });
    console.log("End of lambda");
};