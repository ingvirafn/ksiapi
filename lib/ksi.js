var soap = require('soap');

var createClient = function (soapClient) {
	var m = {};
	var c = soapClient;
	
	// TODO: scrape from http://www.ksi.is/mot/motalisti/
	// This will be added to the original KSI webservice when we get the money from Sepp....hehhh.
	m.getMotList = function(e,s) {
		s([
			{ id:33629, name:'Bikarkeppni - Borgunarbikar karla', year: 2015 },
			{ id:33503, name:'Íslandsmót - Pepsi-deild karla', year: 2015 },
			{ id:33505, name:'Íslandsmót - Pepsi-deild kvenna', year: 2015 },
			{ id:33965, name:'Íslandsmót - 2. flokkur karla A deild', year: 2015 },
			{ id:33967, name:'Bikarkeppni - 2. flokkur karla', year: 2015 }
			]);
	};
	
	m.getMot = function (id, error, success) {
		var args = { MotNumer: id.toString() };
		c.MotLeikir(args, function(err, result) {
		    var games = result.MotLeikirSvar.ArrayMotLeikir.MotLeikur;
			if (err) { error(err); }
			else {
				var res = [];
			    for (var key in result.MotLeikirSvar.ArrayMotLeikir.MotLeikur) {
			  	  res.push(games[key]);
			    }
				success(res);
			}
		  });
	};
	m.getStada = function (id, e, s) {
		var args = { MotNumer: id.toString() };
		c.MotStada(args, function(err, result) {
			if (err) { e(err); }
			else { s(result.MotStadaSvar.ArrayMotStada.MotStada); }
		  });
	};
	m.getMarkahaestu = function(id, e, s) {
		var args = { MotNumer: id.toString() };
		c.MotMarkahaestu(args, function(err, result) {
			if (err) { e(err); }
			else { s(result.MotMarkahaestuSvar.ArrayMotMarkahaestu.MotMarkahaestu); }
		  });
	};
	return m;
};

// Prints out all games in particular Mot
exports.create = function(error, success) {	
//	var url = 'http://www2.ksi.is/vefthjonustur/mot.asmx?WSDL';
	var url = './lib/ksimot.wsdl';
	soap.createClient(url, function(err,client) {
		if (err) { error(err);  }
		else {
			var ksiClient = createClient(client);
			success(ksiClient);
		}
	});
};
