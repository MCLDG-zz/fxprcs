var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var tickers = [];
var sockets = [];
var FETCH_INTERVAL = 5000;

io.on('connection', function(socket) {

	sockets.push(socket);

	socket.on('ticker', function(msg) {
		var ticker = String(msg || '');
		trackTicker(socket, ticker);
	});
});

function trackTicker(socket, ticker) {
	if (!ticker)
		return;

	var data = {
		ticker: ticker,
		socket: socket
	};

	//not very elegant. If length is 6 assume ticker is an FX currency pair
	var fx = false;
	if (ticker.length == 6) {
		fx = true;
	}

	tickers.push(data);
	if (fx) {
		sendFXQuoteToClients(socket, ticker);
	}
	else {
		sendEquityQuoteToClients(socket, ticker);
	}

	//Every N seconds
	var timer = setInterval(function() {
		if (fx) {
			sendFXQuoteToClients(socket, ticker);
		}
		else {
			sendEquityQuoteToClients(socket, ticker);
		}
	}, FETCH_INTERVAL);

	socket.on('disconnect', function() {
		clearInterval(timer);
		sockets.splice(sockets.indexOf(socket), 1);
	});
}

function sendEquityQuoteToClients(socket, ticker) {
	http.get({
		host: 'www.google.com',
		port: 80,
		path: '/finance/info?client=ig&q=' + ticker
	}, function(response) {
		response.setEncoding('utf8');
		var data = "";

		response.on('data', function(chunk) {
			data += chunk;
		});

		response.on('error', function(error) {
			console.log("error on http get = " + error);
		});

		response.on('end', function() {
			if (data.length > 0) {
				try {
					var data_object = JSON.parse(data.substring(3));
				}
				catch (e) {
					return;
				}

				var quote = {};
				quote.ticker = data_object[0].t;
				quote.exchange = data_object[0].e;
				quote.price = data_object[0].l_cur;
				quote.change = data_object[0].c;
				quote.change_percent = data_object[0].cp;
				quote.last_trade_time = data_object[0].lt;
				quote.dividend = data_object[0].div;
				quote.yield = data_object[0].yld;
				socket.emit('quote', quote);
				// Now send this quote to all clients who subscribe to the ticker
				//No need to do this. The 'timer' var above will send to every registered client
				/*				var arrayLength = tickers.length;
								for (var i = 0; i < arrayLength; i++) {
									if (tickers[i].ticker == ticker) {
										tickers[i].socket.emit('quote', quote);
									}
								}*/
			}
		});
	});
}

function sendFXQuoteToClients(socket, ticker) {
	var url =	'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.xchange where pair in ("' 
					+ ticker + '")&format=json&env=store://datatables.org/alltableswithkeys';

	http.get(url
	, function(response) {
		response.setEncoding('utf8');
		console.log("http response = " + response.url + response.statusCode);
		var data = "";

		response.on('data', function(chunk) {
			data += chunk;
		});

		response.on('error', function(error) {
			console.log("error on http get = " + error);
		});

		response.on('end', function() {
			if (data.length > 0) {
				try {
					var data_object = JSON.parse(data);
				}
				catch (e) {
					console.log(e + " " + data);
					return;
				}

				var quote = {};
				quote.ticker = data_object.query.results.rate.id;
				quote.bid = data_object.query.results.rate.Bid;
				quote.ask = data_object.query.results.rate.Ask;
				quote.rate = data_object.query.results.rate.Rate;
				quote.price = data_object.query.results.rate.Rate;
				quote.date = data_object.query.results.rate.Date;
				quote.time = data_object.query.results.rate.Time;
				socket.emit('quote', quote);
			}
		});
	});
}


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
	var addr = server.address();
	console.log("Chat server listening at", addr.address + ":" + addr.port);
});
