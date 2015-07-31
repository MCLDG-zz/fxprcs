angular.module('pricing')
    .directive('chartdirective', function($compile) {
        return {
            restrict: 'AE',
            //Injecting the $scope variables hwere did not seem to work.
            //I had to refer to the symbolID below using $parent
            scope: {
                symbolID: '=',
                newticker: '='
            },
            link: function(scope, element, attrs) {
                var watchlist = scope.$parent.tickerList.watchlist;
                var stringWatchlist = watchlist.toString();
                stringWatchlist = stringWatchlist.replace(/,/g,'","');
                scope.templateHTML = "<div>" +
                    '<script type="text/javascript" src="https://s3.amazonaws.com/tradingview/tv.js"></script>' +
                    '<script type="text/javascript">' +
                    //        '// <![CDATA[' +
                    'new TradingView.widget({' +
                    '"width": 600,' +
                    '"height": 300,' +
                    '"symbol": "'  + scope.$parent.symbolID + '",' +
                    '"interval": "D",' +
                    '"toolbar_bg": "#E4E8EB",' +
                    '"hide_side_toolbar": false,' +
                    '"allow_symbol_change": true,' +
//                    '"watchlist": ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD", "GBPJPY", "EURGBP", "EURJPY", "FX:XAUUSD", "FX:XAGUSD"],' +
                    '"watchlist":["'  + stringWatchlist + '"],' +
                    '"details": false,' +
                    '"hideideas": true' +
                    '});' +
                    //        '// ]]&gt;' +
                    '</script>' +
                    '</div>'

                console.log(scope.templateHTML);
                element.html(scope.templateHTML);
            }
        };
    });
