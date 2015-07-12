module.exports = function(){
	return function(req, res, next) {
          console.log('Request Type:', req.method);
	        return next();
	};
};
