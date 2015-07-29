describe("Ticker Controller Test", function() {
    // Arrange
    var mockScope = {};
    var controller;

    beforeEach(angular.mock.module("pricing"));
    
    beforeEach(module('stateMock'));

    beforeEach(angular.mock.inject(function($httpBackend, $state) {
        backend = $httpBackend;
        state = $state;

        backend.expect("GET", "/users/watchlist").respond(
            [{
                "_id": "55a8c8801fdb2963257bcd4b",
                "watchlist": ["AUDNZD", "USDEUR", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "USDNZD", "AUDGBP", "USDCNY", "EURZAR"]
            }]);
        backend.expect("GET", "/orders/pendingorder").respond(
            [{
                "_id": "55a8c8801fdb2963257bcd4b",
                "watchlist": ["AUDNZD", "USDEUR", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "USDNZD", "AUDGBP", "USDCNY", "EURZAR"]
            }]);
        backend.expect("GET", "/users/balance").respond(
            [{
                "_id": "55aef5c79d0aeed18904c033",
                "username": "Michael",
                "cashbalance": 5500,
                "assetvalue": 10200,
                "netunsettled": 525,
                "accountvalue": 15700
            }]);

        backend.expect("GET", "/ref/countrytocurrency").respond(
            [{ "_id" : "55af5f2b2de9f8cc830f428b", "BD" : "BDT", "EU" : "EUR", "BF" : "XOF", "BG" : "BGN", "BA" : "BAM", "BB" : "BBD", "WF" : "XPF", "BL" : "EUR", "BM" : "BMD", "BN" : "BND", "BO" : "BOB", "BH" : "BHD", "BI" : "BIF", "BJ" : "XOF", "BT" : "BTN", "JM" : "JMD", "BV" : "NOK", "BW" : "BWP", "WS" : "WST", "BR" : "BRL", "BS" : "BSD", "BY" : "BYR", "BZ" : "BZD", "RU" : "RUB", "RW" : "RWF", "RS" : "RSD", "RE" : "EUR", "TM" : "TMT", "TJ" : "TJS", "RO" : "RON", "GW" : "XOF", "GT" : "GTQ", "GR" : "EUR", "GQ" : "XAF", "GP" : "EUR", "JP" : "JPY", "GY" : "GYD", "GF" : "EUR", "GE" : "GEL", "GD" : "XCD", "GB" : "GBP", "GA" : "XAF", "GN" : "GNF", "GM" : "GMD", "GL" : "DKK", "GI" : "GIP", "GH" : "GHS", "OM" : "OMR", "TN" : "TND", "JO" : "JOD", "HR" : "HRK", "HT" : "HTG", "HU" : "HUF", "HK" : "HKD", "HN" : "HNL", "VE" : "VEF", "PS" : "ILS", "PT" : "EUR", "SJ" : "NOK", "PY" : "PYG", "IQ" : "IQD", "PA" : "PAB", "PF" : "XPF", "PG" : "PGK", "PE" : "PEN", "PK" : "PKR", "PH" : "PHP", "PL" : "PLN", "PM" : "EUR", "ZM" : "ZMK", "EH" : "MAD", "EE" : "EUR", "EG" : "EGP", "ZA" : "ZAR", "IT" : "EUR", "VN" : "VND", "SB" : "SBD", "ET" : "ETB", "SO" : "SOS", "ZW" : "ZWL", "SA" : "SAR", "ES" : "EUR", "ER" : "ERN", "ME" : "EUR", "MD" : "MDL", "MG" : "MGA", "MF" : "EUR", "MA" : "MAD", "MC" : "EUR", "UZ" : "UZS", "MM" : "MMK", "ML" : "XOF", "MO" : "MOP", "MN" : "MNT", "MK" : "MKD", "MU" : "MUR", "MT" : "EUR", "MW" : "MWK", "MV" : "MVR", "MQ" : "EUR", "MS" : "XCD", "MR" : "MRO", "IM" : "GBP", "UG" : "UGX", "TZ" : "TZS", "MY" : "MYR", "MX" : "MXN", "IL" : "ILS", "FR" : "EUR", "SH" : "SHP", "FI" : "EUR", "FJ" : "FJD", "FK" : "FKP", "FO" : "DKK", "NI" : "NIO", "NL" : "EUR", "NO" : "NOK", "NA" : "NAD", "VU" : "VUV", "NC" : "XPF", "NE" : "XOF", "NG" : "NGN", "NZ" : "NZD", "NP" : "NPR", "XK" : "EUR", "CI" : "XOF", "CH" : "CHF", "CO" : "COP", "CN" : "CNY", "CM" : "XAF", "CL" : "CLP", "CA" : "CAD", "CG" : "XAF", "CF" : "XAF", "CD" : "CDF", "CZ" : "CZK", "CY" : "EUR", "CR" : "CRC", "CW" : "ANG", "CV" : "CVE", "CU" : "CUP", "SZ" : "SZL", "SY" : "SYP", "SX" : "ANG", "KG" : "KGS", "KE" : "KES", "SS" : "SSP", "SR" : "SRD", "KH" : "KHR", "KN" : "XCD", "KM" : "KMF", "ST" : "STD", "SK" : "EUR", "KR" : "KRW", "SI" : "EUR", "KP" : "KPW", "KW" : "KWD", "SN" : "XOF", "SM" : "EUR", "SL" : "SLL", "SC" : "SCR", "KZ" : "KZT", "KY" : "KYD", "SG" : "SGD", "SE" : "SEK", "SD" : "SDG", "DO" : "DOP", "DM" : "XCD", "DJ" : "DJF", "DK" : "DKK", "DE" : "EUR", "YE" : "YER", "DZ" : "DZD", "US" : "USD", "UY" : "UYU", "YT" : "EUR", "LB" : "LBP", "LC" : "XCD", "LA" : "LAK", "TW" : "TWD", "TT" : "TTD", "TR" : "TRY", "LK" : "LKR", "LI" : "CHF", "LV" : "EUR", "TO" : "TOP", "LT" : "LTL", "LU" : "EUR", "LR" : "LRD", "LS" : "LSL", "TH" : "THB", "TF" : "EUR", "TG" : "XOF", "TD" : "XAF", "LY" : "LYD", "VA" : "EUR", "VC" : "XCD", "AE" : "AED", "AD" : "EUR", "AG" : "XCD", "AF" : "AFN", "AI" : "XCD", "IS" : "ISK", "IR" : "IRR", "AM" : "AMD", "AL" : "ALL", "AO" : "AOA", "AQ" : "", "AR" : "ARS", "AU" : "AUD", "AT" : "EUR", "AW" : "AWG", "IN" : "INR", "AX" : "EUR", "AZ" : "AZN", "IE" : "EUR", "ID" : "IDR", "UA" : "UAH", "QA" : "QAR", "MZ" : "MZN" }]
        );
        
        //state.expectTransitionTo('watchlist');
    }));

    beforeEach(angular.mock.inject(function($controller, $rootScope, $http) {
        mockScope = $rootScope.$new();
        controller = $controller("tickerCtrl", {
            $scope: mockScope,
            $http: $http
        });
        backend.flush();
    }));

    //Assess
    it("TickerCtrl - makes Ajax requests", function() {
       backend.verifyNoOutstandingExpectation(); 
    });

    it("TickerCtrl - check the data is returned", function() {
        expect(mockScope.balance).toBeDefined();
        expect(mockScope.balance.length).toEqual(1);
        expect(mockScope.tickerList.watchlist.length).toEqual(10);
    });
    it("TickerCtrl - check the data is as expected", function() {
        expect(mockScope.balance[0].username).toEqual('Michael');
        expect(mockScope.balance[0].cashbalance).toEqual(5500);
    });
    
    // Act 
    //this is a pretty useless test since I set the balance as the first statement
    it("TickerCtrl - update user balance", function() {
        mockScope.balance[0].cashbalance = 6500;
        backend.expectPOST('/users/updatebalance', mockScope.balance[0]).respond(201, '');
        mockScope.updateBalance();
        mockScope.loadBalance();
        console.log("mockScope balance is: " + JSON.stringify(mockScope.balance));
        expect(mockScope.balance[0].cashbalance).toEqual(6500);
    })

    //Update items from watchlist
    it("TickerCtrl - update watchlist", function() {
        //Remove first item
        expect(mockScope.tickerList.watchlist.length).toEqual(10);
        mockScope.removeFromWatchlist('AUDNZD');
        expect(mockScope.tickerList.watchlist.length).toEqual(9);

        //Remove last item
        mockScope.removeFromWatchlist('EURZAR');
        expect(mockScope.tickerList.watchlist.length).toEqual(8);

        //Remove middle item
        mockScope.removeFromWatchlist('USDCAD');
        expect(mockScope.tickerList.watchlist.length).toEqual(7);
        
        //Remove item that does not exist
        mockScope.removeFromWatchlist('EURZAR');
        expect(mockScope.tickerList.watchlist.length).toEqual(7);
        
        /*
        * Try to add item to watchlist. It should fail because there is no quote in the 'quotes' array 
        * matching this symbol (note that AUDNZD does not exist in mockScope.quotes).
        * In the current flow, a user will search for a symbol (which will add it to the 'quotes' array and
        * obtain the pricing from the server), then they will add it to the watchlist. addToWatchlist will
        * therefore check that the quote exists before adding it to the watchlist
        */
        mockScope.addWatchlistResult = null;
        mockScope.quotes = [{"ticker":"USDEUR","bid":"0.9025","ask":"0.9027","rate":"0.9025","price":"0.9025","date":"7/29/2015","time":"3:56am"},{"ticker":"GBPUSD","bid":"1.5612","ask":"1.5616","rate":"1.5614","price":"1.5614","date":"7/29/2015","time":"3:56am"},{"ticker":"USDJPY","bid":"123.3600","ask":"123.3800","rate":"123.3600","price":"123.3600","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCHF","bid":"0.9610","ask":"0.9612","rate":"0.9610","price":"0.9610","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCAD","bid":"1.2932","ask":"1.2934","rate":"1.2932","price":"1.2932","date":"7/29/2015","time":"3:56am"},{"ticker":"USDNZD","bid":"1.4889","ask":"1.4891","rate":"1.4889","price":"1.4889","date":"7/29/2015","time":"3:56am"},{"ticker":"AUDGBP","bid":"0.4696","ask":"0.4698","rate":"0.4697","price":"0.4697","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCNY","bid":"6.2096","ask":"6.2104","rate":"6.2096","price":"6.2096","date":"7/29/2015","time":"3:55am"},{"ticker":"EURZAR","bid":"13.9099","ask":"13.9275","rate":"13.9187","price":"13.9187","date":"7/29/2015","time":"3:56am"}];
        var addWatchResult = mockScope.addToWatchlist('AUDNZD');
        expect(mockScope.tickerList.watchlist.length).toEqual(7);
        expect(mockScope.addWatchlistResult.toString()).toEqual('<strong>AUDNZD</strong> is invalid - cannot add to watchlist');
        
        /*
        * Now let's add a new symbol to 'quotes' and try addToWatchlist again. It should succeed
        */
        mockScope.addWatchlistResult = null;
        mockScope.quotes = [{"ticker":"AUDNZD","bid":"1.0914","ask":"1.0926","rate":"1.0920","price":"1.0920","date":"7/29/2015","time":"3:56am"},{"ticker":"USDEUR","bid":"0.9025","ask":"0.9027","rate":"0.9025","price":"0.9025","date":"7/29/2015","time":"3:56am"},{"ticker":"GBPUSD","bid":"1.5612","ask":"1.5616","rate":"1.5614","price":"1.5614","date":"7/29/2015","time":"3:56am"},{"ticker":"USDJPY","bid":"123.3600","ask":"123.3800","rate":"123.3600","price":"123.3600","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCHF","bid":"0.9610","ask":"0.9612","rate":"0.9610","price":"0.9610","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCAD","bid":"1.2932","ask":"1.2934","rate":"1.2932","price":"1.2932","date":"7/29/2015","time":"3:56am"},{"ticker":"USDNZD","bid":"1.4889","ask":"1.4891","rate":"1.4889","price":"1.4889","date":"7/29/2015","time":"3:56am"},{"ticker":"AUDGBP","bid":"0.4696","ask":"0.4698","rate":"0.4697","price":"0.4697","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCNY","bid":"6.2096","ask":"6.2104","rate":"6.2096","price":"6.2096","date":"7/29/2015","time":"3:55am"},{"ticker":"EURZAR","bid":"13.9099","ask":"13.9275","rate":"13.9187","price":"13.9187","date":"7/29/2015","time":"3:56am"}];
        expect(mockScope.quotes.length).toEqual(10);
        var addWatchResult = mockScope.addToWatchlist('AUDNZD');
        expect(mockScope.tickerList.watchlist.length).toEqual(8);

        /*
        * Add the same symbol to watchlist again. It should fail since it already exists
        */
        mockScope.addWatchlistResult = null;
        mockScope.quotes = [{"ticker":"AUDNZD","bid":"1.0914","ask":"1.0926","rate":"1.0920","price":"1.0920","date":"7/29/2015","time":"3:56am"},{"ticker":"USDEUR","bid":"0.9025","ask":"0.9027","rate":"0.9025","price":"0.9025","date":"7/29/2015","time":"3:56am"},{"ticker":"GBPUSD","bid":"1.5612","ask":"1.5616","rate":"1.5614","price":"1.5614","date":"7/29/2015","time":"3:56am"},{"ticker":"USDJPY","bid":"123.3600","ask":"123.3800","rate":"123.3600","price":"123.3600","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCHF","bid":"0.9610","ask":"0.9612","rate":"0.9610","price":"0.9610","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCAD","bid":"1.2932","ask":"1.2934","rate":"1.2932","price":"1.2932","date":"7/29/2015","time":"3:56am"},{"ticker":"USDNZD","bid":"1.4889","ask":"1.4891","rate":"1.4889","price":"1.4889","date":"7/29/2015","time":"3:56am"},{"ticker":"AUDGBP","bid":"0.4696","ask":"0.4698","rate":"0.4697","price":"0.4697","date":"7/29/2015","time":"3:56am"},{"ticker":"USDCNY","bid":"6.2096","ask":"6.2104","rate":"6.2096","price":"6.2096","date":"7/29/2015","time":"3:55am"},{"ticker":"EURZAR","bid":"13.9099","ask":"13.9275","rate":"13.9187","price":"13.9187","date":"7/29/2015","time":"3:56am"}];
        expect(mockScope.quotes.length).toEqual(10);
        var addWatchResult = mockScope.addToWatchlist('AUDNZD');
        expect(addWatchResult).toBeFalsy();
        expect(mockScope.tickerList.watchlist.length).toEqual(8);
        expect(mockScope.addWatchlistResult.toString()).toEqual('<strong>AUDNZD</strong> is already in your watchlist');

        /*
        * Now remove the recently added symbol
        */
        expect(mockScope.tickerList.watchlist.length).toEqual(8);
        mockScope.removeFromWatchlist('AUDNZD'); 
        expect(mockScope.tickerList.watchlist.length).toEqual(7);
    })
});