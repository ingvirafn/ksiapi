var soap = require('soap');
var cheerio = require('cheerio');
var http = require('request');

var debug = debug || console.log;

var createClient = function (soapClient) {
	var m = {};
	var c = soapClient;
	
	m.getMotList = function(errorCallback, success) {
		var year = 2015;
		// if (!pars && !pars.id && !pars.felagNumer) throw Error('Parameters missing');
		var url = "http://www.ksi.is/mot/motalisti/?flokkur=%25&tegund=%25&AR={year}&kyn=%25";
		url = url.replace('{year}', year.toString());

		http(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				try {
					var res = [];
					var $ = cheerio.load(body);
					$('#mot-tafla > tr').each(function(i, elem) {
						var entry = $('td > a',this);
						var n = entry.text().trim();
						if (n && n.length > 0) {
							var att = entry.attr('href').split('=')[1];
							var flokkur = $('td:nth-child(4)', this).text().trim();
							res.push({ id: parseInt(att), name: entry.text(), flokkur: flokkur, year: year });
						}
					});
					success(res);
				} catch (ex) {
					errorCallback(ex);
				}
			}
			else {
				errorCallback(error);
			}
		});

	};
	
	m.getMot = function (pars, error, success) {
		var args = { MotNumer: pars.id.toString() };
		c.MotLeikir(args, function(err, result) {
			try {
			    var games = result.MotLeikirSvar.ArrayMotLeikir.MotLeikur;
				if (err) { error(err); }
				else {
					var res = [];
				    for (var key in result.MotLeikirSvar.ArrayMotLeikir.MotLeikur) {
						if (!pars.teamId || (games[key].FelagHeimaNumer == pars.teamId || games[key].FelagUtiNumer == pars.teamId))
						{
							res.push(games[key]);
						}
				    }
					success(res);
				}
			} catch (e) {
				error(e);
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
	
	m.getLeikmenn = function(id, e, s) {
		var args = { LeikurNumer: id.toString() };
		c.LeikurLeikmenn(args, function(err, result) {
			if (err) { e(err); }
			else { s(result.LeikurLeikmennSvar.ArrayLeikurLeikmenn.LeikurLeikmenn); }
		  });
	};

	m.getLeikurAtburdir = function(id, e, s) {
		var args = { LeikurNumer: id.toString() };
		c.LeikurAtburdir(args, function(err, result) {
			if (err) { e(err); }
			else { s(result.LeikurAtburdurSvar.ArrayLeikurAtburdir.LeikurAtburdir);}//.LeikurAtburdir); }
		  });
	};

	m.getMotGroupByDate = function (id, error, success) {
		m.getMot(id, error, function(arr) {
			// filter out todays..
			var today = new Date();
			var res = {};

			arr.forEach(function(element) {
				var dateString = element.LeikDagur.getDate().toString() + "." + element.LeikDagur.getMonth().toString() + "." + element.LeikDagur.getFullYear().toString();
				if (!(dateString in res)) {
					res[dateString] = [];
				}
				res[dateString].push(element);
			}, this);
			
			success(res);
		});
	};
	
	//
	// Scraping
	//
	m.getLeikmenn = function (pars, errorCallback, success) {
		
		if (!pars && !pars.id && !pars.felagNumer) throw Error('Parameters missing');

		var url = "http://www.ksi.is/mot/leikmenn/?felag={felagNumer}&stada=1&kyn={kyn}&ArgangurFra=1960&ArgangurTil=2005";
		url = url.replace('{felagNumer}', (pars.id || pars.felagNumer).toString())
				 .replace('{kyn}', pars.kyn || pars.sex || '%25');
		http(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				try {
					var res = [];
					var $ = cheerio.load(body);
					$('#listi-tafla > tr').each(function(i, elem) {
						var entry = $('td > a',this);
						var n = entry.text().trim();
						if (n && n.length > 0) {
							var att = entry.attr('href').split('=')[1];
							var year = parseInt($('td:nth-child(3)', this).text().trim());
							res.push({ id: parseInt(att), name: entry.text(), birthYear: year });
						}
					});
					success(res);
				} catch (ex) {
					errorCallback(ex);
				}
			}
			else {
				errorCallback(error);
			}
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
