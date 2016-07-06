var http = require('http');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');

// Require libraries.
var aws = require( "aws-sdk" );
var Q = require( "q" );
var chalk = require( "chalk" );

var app = express();
var server = http.createServer(app);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

module.exports = app;

var kafka = require('kafka-node'),
     Consumer = kafka.Consumer,
     client = new kafka.Client('104.155.231.216:2181'),
     consumer = new Consumer(
	client,
        [
            { topic: 'fxorder', partition: 0 }
        ],
        {
            autoCommit: false
        }
    );

consumer.on('message', function (message) {
    console.log('Balance sidecar received order msg: %j', message);
    console.log(message.value.toString());
    console.log('Balance sidecar received order msg: %j', message.value);

    request({
      url: "http://web-balance:80/adjustbalance",
      method: "POST",
      json: true,   // <--Very important!!!
      body: message.value
  }, function (error, response, body){
      console.log('Post adjustbalance response:  ' + response + ' error: ' + error);
  });

});
consumer.on('error', function (err) {
    console.log('error', err);
});
//publish to AWS SQS
// Create an instance of our SQS Client.
var sqs = new aws.SQS({
    region: "us-west-2",
    accessKeyId: process.env.AWS_SECRET_ACCESS_KEYID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    params: {
        QueueUrl: "https://sqs.us-west-2.amazonaws.com/185711092606/fxprcs-orders"
    }
});
var receiveMessage = Q.nbind( sqs.receiveMessage, sqs );
var deleteMessage = Q.nbind( sqs.deleteMessage, sqs );

// When pulling messages from Amazon SQS, we can open up a long-poll which will hold open
// until a message is available, for up to 20-seconds. If no message is returned in that
// time period, the request will end "successfully", but without any Messages. At that
// time, we'll want to re-open the long-poll request to listen for more messages. To
// kick off this cycle, we can create a self-executing function that starts to invoke
// itself, recursively.
(function pollQueueForMessages() {

    console.log( chalk.yellow( "Starting long-poll operation." ) );

    // Pull a message - we're going to keep the long-polling timeout short so as to
    // keep the demo a little bit more interesting.
    receiveMessage({
        WaitTimeSeconds: 3, // Enable long-polling (3-seconds).
        VisibilityTimeout: 10
    })
    .then(
        function handleMessageResolve( data ) {

            // If there are no message, throw an error so that we can bypass the
            // subsequent resolution handler that is expecting to have a message
            // delete confirmation.
            if ( ! data.Messages ) {

                throw(
                    workflowError(
                        "EmptyQueue",
                        new Error( "There are no messages to process." )
                    )
                );

            }
    //Message from SQS will look as follows:
    //{"MessageId":"d13413c1-ebb5-48ed-aa6b-3fda376216fe","ReceiptHandle":"AQEBMRQz28EFihR0BE3E+RTYXGNYAy+bGA5bjGF1AMr5aXm9DjcxBuCQJydcWY5G91gKylsnSIKxV0Kdo/r3NfhkJ3oa931jg28K0kka3nHDr/IgCCMR5fjbLD+5QqrpsJWGkDjfvCi15NnKzrFJd7AH3pdLBVEXcpTAa4E8Wa2BpUsiZeFJaaV3IB015VR9OwmGLXe8wdRrKvRTbAZp/gpRvgfWUjDBgmFgVRhSTrS1zmuxQTYFO8nJB0yMHDyQVxIoPd7G1CVWwlbqVLePwvNne0HZIlPufIRpPMvKCN/GM1L6RS6OZCjPXpbbWDv2MKOjaWOU2SYTfuhAFrhiEO23iqVpxEi0pw5UpM0auvTZBhs2IExvUzQjs4NRrFP4lxA+rQenJubOyMv9sFPuvsww8g==","MD5OfBody":"ea0c4310b6bf1be8e87393b28b6584c5","Body":"{\"ticker\":\"USDAUD\",\"price\":\"1.3258\",\"orderType\":\"Market\",\"orderDate\":\"2016-07-05T07:52:11.569Z\",\"currencyAmountToBuy\":1,\"_id\":\"577b68d160f73b1200859079\"}"}
    console.log('Balance sidecar received order msg from AWS SQS: %j', data.Messages[0]);
    console.log('Balance sidecar received order msg: %j', data.Messages[ 0 ].MessageId);

    request({
      url: "http://web-balance:80/adjustbalance",
      method: "POST",
      json: true,   // <--Very important!!!
      body: JSON.parse(data.Messages[ 0 ].Body)
  }, function (error, response, body){
      console.log('Post adjustbalance response:  ' + response + ' error: ' + error);
  });

            // ---
            // TODO: Actually process the message in some way :P
            // ---
            console.log( chalk.green( "Deleting:", data.Messages[ 0 ].MessageId ) );

            // Now that we've processed the message, we need to tell SQS to delete the
            // message. Right now, the message is still in the queue, but it is marked
            // as "invisible". If we don't tell SQS to delete the message, SQS will
            // "re-queue" the message when the "VisibilityTimeout" expires such that it
            // can be handled by another receiver.
            return(
                deleteMessage({
                    ReceiptHandle: data.Messages[ 0 ].ReceiptHandle
                })
            );

        }
    )
    .then(
        function handleDeleteResolve( data ) {

            console.log( chalk.green( "Message Deleted!" ) );

        }
    )

    // Catch any error (or rejection) that took place during processing.
    .catch(
        function handleError( error ) {

            // The error could have occurred for both known (ex, business logic) and
            // unknown reasons (ex, HTTP error, AWS error). As such, we can treat these
            // errors differently based on their type (since I'm setting a custom type
            // for my business logic errors).
            switch ( error.type ) {
                case "EmptyQueue":
                    console.log( chalk.cyan( "Expected Error:", error.message ) );
                break;
                default:
                    console.log( chalk.red( "Unexpected Error:", error.message ) );
                break;
            }

        }
    )

    // When the promise chain completes, either in success of in error, let's kick the
    // long-poll operation back up and look for moar messages.
    .finally( pollQueueForMessages );

})();

// When processing the SQS message, we will use errors to help control the flow of the
// resolution and rejection. We can then use the error "type" to determine how to
// process the error object.
function workflowError( type, error ) {

    error.type = type;

    return( error );

}
server.listen(3003, "0.0.0.0", function() {
	var addr = server.address();
	console.log("Balance sidecar server listening at", addr.address + ":" + addr.port);
});
