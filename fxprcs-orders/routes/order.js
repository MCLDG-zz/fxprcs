var kafka = require('kafka-node'),
     Producer = kafka.Producer,
     client = new kafka.Client('104.155.231.216:2181'),
     producer = new Producer(client);

// Require libraries.
var aws = require( "aws-sdk" );
var Q = require( "q" );
var chalk = require( "chalk" );

var appRouter = function(app) {

app.get('/', function(req, res) {
    res.send("Hello World - the Order API is here. Try GET or POST /order");
});


/* GET order data */
app.get('/order', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/* GET pending order data */
app.get('/pendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/*
 * Store the Order and publish to Kafka.
 */
app.post('/order', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');
    console.log('received posted order. Storing in DB and publishing to kafka: %j', req.body);
    collection.insert(req.body, function(err, result) {
        if (err) return;
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
	//publish to kafka
	//console.log('publishing order to Kafka');
	//kafka_payload = [
	//	{ topic: 'fxorder', messages: req.body, partition: 0 },
	//];
	//producer.send(kafka_payload, function(err, data){
	//	console.log(data, err)
	//});

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
var sendMessage = Q.nbind( sqs.sendMessage, sqs );
sendMessage({
    MessageBody: JSON.stringify(req.body)
})
.then(
    function handleSendResolve( data ) {

        console.log( chalk.green( "Message sent:", data.MessageId ) );

    }
)

// Catch any error (or rejection) that took place during processing.
.catch(
    function handleReject( error ) {

        console.log( chalk.red( "Unexpected Error:", error.message ) );

    }
);
});

/*
 * POST to pendingorder.
 */
app.post('/pendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.insert(req.body, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

/*
 * Delete pendingorder.
 */
app.delete('/pendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.remove({
        _id: req.body._id
    }, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

}
module.exports = appRouter;

