var express = require('express');
var router = express.Router();

/* GET balance data */
router.get('/balance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/* Update balance */
router.post('/updatebalance', function(req, res) {
    var db = req.db;
    var id = req.body._id;
    var body = req.body;
    delete body._id;
    
    var collection = db.get('userbalance');
    collection.findAndModify({ "_id": id }, { "$set": body },
        function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});    

/* GET watchlist data */
router.get('/watchlist', function(req, res) {
    var db = req.db;
    var collection = db.get('userwatchlist');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * Update watchlist - this is a Mongo update, where we
 * update the entire watchlist document. This can be used
 * for adding or removing watchlist items
 */
router.post('/updatewatchlist', function(req, res) {
    var db = req.db;
    var id = req.body._id;
    var body = req.body;
    delete body._id;
    
    var collection = db.get('userwatchlist');
    collection.findAndModify({ "_id": id }, { "$set": body },
        function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});    


/* GET notification data */
router.get('/notification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to notifications.
 */
router.post('/addnotification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});


/*
 * Delete notification.
 */
router.post('/delnotification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
    collection.remove({_id: req.body._id}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * Get weather data
 */
router.get('/getweather', function(req, res) {
	var soap = require('soap');
	var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?wsdl';
	var args = {ZIP: req.query.ZIP};
	
	soap.createClient(url, function(err, client) {
		client.GetCityWeatherByZIP(args, function(err, result) {
			console.log("GetCityWeather args are: " + args);
			console.log("GetCityWeather err is: " + err);
			console.log(result);
			var response = {city: result.GetCityWeatherByZIPResult.City, state: result.GetCityWeatherByZIPResult.State, temp: result.GetCityWeatherByZIPResult.Temperature};
			res.send(result);
			res.end();
		});
	});
});

/*
 * Post weather data
 */
router.post('/postweather', function(req, res) {
	var soap = require('soap');
	var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?wsdl';
	var args = {ZIP: req.query.ZIP};
	console.log("GetCityWeather args are: " + args);
	
	soap.createClient(url, function(err, client) {
		client.GetCityWeatherByZIP(args, function(err, result) {
			console.log("GetCityWeather err is: " + err);
			console.log(result);
			//var response = {city: result.GetCityWeatherByZIPResult.City, state: result.GetCityWeatherByZIPResult.State, temp: result.GetCityWeatherByZIPResult.Temperature};
			res.send(result);
			res.end();
		});
	});
});

module.exports = router;