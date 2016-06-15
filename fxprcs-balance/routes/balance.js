var appRouter = function(app) {


app.get('/', function(req, res) {
    res.send("Hello World - the Balance API is here. Try GET or POST /balance");
});

/* GET balance data */
app.get('/balance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

app.post("/balance", function(req, res) {
    var db = req.db;
    var id = req.body._id;
    var body = req.body;
    delete body._id;

    var collection = db.get('userbalance');
    collection.findAndModify({
            "_id": id
        }, {
            "$set": body
        },
        function(err, result) {
            res.send(
                (err === null) ? {
                    msg: ''
                } : {
                    msg: err
                }
            );
        });

});
// updatebalance
// { "_id" : ObjectId("575e7450722c741bd98717fd"), "username" : "Michael", "cashbalance" : 9982.364299999997, "assetvalue" : 17.6357, "netunsettled" : 0, "accountvalue" : 9999.999999999996 }
// incoming 'order' looks as follows:
// { "_id" : ObjectId("575e85e7000e4811000ec517"), "ticker" : "USDAUD", "price" : "1.3574", "orderType" : "Market", "orderDate" : "2016-06-13T10:07:34.738Z", "currencyAmountToBuy" : 1 }
// 
app.post("/adjustbalance", function(req, res) {
    console.log('adjustbalance based on order: %j', req.body);
    console.log('order price: %j', req.body.price);
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({},{},function(e,docs){

	if (e) {
		console.log('error finding existing userbalance: ' + e);
		res.send(e);
		return;
	}

	    console.log('found existing balance record: %j', docs);

	    var id = req.body._id;
	    var body = req.body;
	    var orderAmt = req.body.price * req.body.currencyAmountToBuy;
	    console.log('order amount to apply: ' + orderAmt + ' ' + docs[0].cashbalance + ' ' + docs[0].assetvalue);
	    delete body._id;

	    var collection = db.get('userbalance');
	    collection.findAndModify({
		"query": { "username": "Michael" },
		"update": { 
		    "$set": { 
			"cashbalance": docs[0].cashbalance - orderAmt, 
			"assetvalue": docs[0].assetvalue + orderAmt 
		    }
		}
	    },
	    function(err, result) {
		res.send(
		    (err === null) ? {
			msg: result
		    } : {
			msg: err
		    }
		);
	    });
    });
});

}
module.exports = appRouter;
