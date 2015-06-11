var debug = debug || console.log;

// Setup server
var express = require('express');
var app = express();
var ksiModule = require('./lib/ksi.js');

// Setup KSÍ client, the server
var ksiClient, server;
var SERVERPORT = process.env.PORT || 3000;

// Enable CORS
var cors = require('./lib/cors.js');
app.use(cors());

// Enable SignatureHeaders
// var expireFilterPassword = 'krapp';
// 
// var sh = require('./lib/signatureHeaders.js');
// 
// app.get('/getToken', function (req, res) {
// 	var expireDate = new Date();
// 	expireDate.setDate(expireDate.getDate()+1);
// 	var token = sh.generateExpireToken(expireDate, expireFilterPassword);
// 	res.json({ Expires: expireDate, Token: token });
// });
// 
// app.use(sh.expireFilter(expireFilterPassword));

// Error handling..
var onError = function(res, text) {
	res.json({error: text });
};
// Success handling
var onSuccess = function(res) {
	return function(data) {
		return res.json(data);
	};
};


// 
// KSÍ API routes
// 
var apiRoutes = [];
// List of tournaments
var apiTournaments = { 
	route: '/tournaments', 
	desc: 'Lists tournaments (currently just fixed list)',
	handler: function (req, res) {
		var err = function(p) { onerror(res, p); };
		try {
			ksiClient.getMotList(err, onSuccess(res));
		} catch (error) {
			err(error);
		}
	}
};
apiRoutes.push(apiTournaments);

// Games in tournament
var apiGames = { 
	route: '/games/:id', 
	desc: 'Lists games in a tournament',
	handler: function (req, res) {
		var err = function(p) { onerror(res, p); };
		try {
			ksiClient.getMot(req.params.id, err, onSuccess(res));
		} catch (error) {
			err(error);
		}
	}
};
apiRoutes.push(apiGames);

// Scoretable for tournament
var apiScoretable = { 
	route: '/table/:id', 
	desc: 'Returns the table for given tournament',
	handler: function (req, res) {
		var err = function(p) { onerror(res, p); };
		try {
			ksiClient.getStada(req.params.id, err, onSuccess(res));
		} catch (error) {
			err(error);
		}
	}
};
apiRoutes.push(apiScoretable);

// Top goal scorers in tournament
var apiGoalscorers = { 
	route: '/topscorers/:id', 
	desc: 'Lists the top scorers for given tournament',
	handler: function (req, res) {
		var err = function(p) { onerror(res, p); };
		try {
			ksiClient.getMarkahaestu(req.params.id, err, onSuccess(res));
		} catch (error) {
			err(error);
		}
	}
};
apiRoutes.push(apiGoalscorers);

var apiLeikmenn = { 
	route: '/players/:teamId', 
	desc: 'Lists the registered player for given team',
	handler: function (req, res) {
		var err = function(p) { onerror(res, p); };
		try {
			ksiClient.getLeikmenn({ id: req.params.teamId }, err, onSuccess(res));
		} catch (error) {
			err(error);
		}
	}
};

apiRoutes.push(apiLeikmenn);

var baseApiRoute = '/ksiapi';

// Register the routes
for (var key in apiRoutes) {
	var enRoute = apiRoutes[key];
	var fullRoute = baseApiRoute + enRoute.route;
	app.get(fullRoute, enRoute.handler);
	debug('- Registering route ' + fullRoute);
}

// api route directory
app.get(baseApiRoute, function (req, res) {
	res.json(apiRoutes.map(function(x) { 
		return { 
			desc: x.desc, 
			route: baseApiRoute+x.route, 
			demoroute: baseApiRoute+x.route.replace(':id', '33503').replace(':teamId', '230') 
		}; 
	}));
});

// 
// / KSÍ API routes
// 

// Statics
app.use(express.static('public'));


// ELSE!
app.use(function(req, res, next){
	res.writeHead(302, {
	  'Location': '/'
	});
	res.end();
});

// Start the app
ksiModule.create(
	function(err) { debug('could not create ksi client'); }, 
	function (client) {
		debug('KSI Client created');
		ksiClient = client;
		server = app.listen(SERVERPORT, function() {
		  debug('Express server listening on port ' + server.address().port);
		});
	}
);
