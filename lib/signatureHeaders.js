

// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

var m = {};

m.encrypt = function (text, password){
  var cipher = crypto.createCipher(algorithm,password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};
 
m.decrypt = function(text, password){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
};
m.generateExpireToken = function(expireDate, password) {
	return m.encrypt(expireDate.toISOString(), password);
};
m.expireFilter = function(password){
	return function(req, res, next) {
		try {
			
			// console.log(req.headers);
			
			if ('x-expirefilter' in req.headers) {
				console.log('header exists');
				var headerValue = req.headers['x-expirefilter'];
				if (headerValue && headerValue.length > 0)
				{
					console.log('Expire encrypted: ' + headerValue);
					var expireDateDecrypted = m.decrypt(headerValue, password);
					var expireDate = new Date(expireDateDecrypted);
					console.log('Expire decrypted: ' + expireDateDecrypted);
					if (expireDate > new Date()) {
						return next();
					}
					else {
						console.log('Token expired');
					}
				}
			}
			
			throw new Error('Not authenticated');
			
		} catch (error) {
			console.log('Expire filter: '+error);
			return res.sendStatus(401);			
		}
// 	    res.header('Access-Control-Allow-Origin', '*');
// 	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
// 	    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');
// 
// 	    if(req.method !== 'OPTIONS')
// 	        return next();
// 
// 	    return res.send(200);
	};
};
module.exports = m;
