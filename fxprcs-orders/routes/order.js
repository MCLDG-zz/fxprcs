var kafka = require('kafka-node'),
     Producer = kafka.Producer,
     client = new kafka.Client('104.155.231.216:2181'),
     producer = new Producer(client);

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
 * POST to userorder.
 */
app.post('/order', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');
    console.log('posting order: ' + req.body);
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
	kafka_payload = [
		{ topic: 'fxorder', messages: req.body, partition: 0 },
	];
	producer.send(kafka_payload, function(err, data){
		console.log(data, err)
	});

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

