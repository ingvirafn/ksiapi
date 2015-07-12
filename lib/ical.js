Date.prototype.format = function() {
	// 20150623T190000Z
	var f = function (x) { if (x.toString().length == 1) { return '0'+x.toString(); } else { return x.toString(); } };
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var datePart = yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
	   var timePart = f(this.getHours()) + f(this.getMinutes()) + f(this.getSeconds());
   return datePart + 'T' + timePart + 'Z';
};

var ical = {
	create : function(prodid, entries) {
		var begin = 
		"BEGIN:VCALENDAR\n\
VERSION:2.0\n\
PRODID:"+prodid+"\n";
		var body = "";	
		entries.forEach(function(element) {
			body += "BEGIN:VEVENT\n\
DTSTAMP:"+(new Date()).format()+"\n\
UID:"+element.uid+"@ksi.is\n\
ORGANIZER:MAILTO:ksi@ksi.is\n\
DTSTART:"+element.start.format()+"\n\
DTEND:"+element.end.format()+"\n\
SUMMARY:" + element.name + "\n\
END:VEVENT\n";
		}, this);
		
		var end = "END:VCALENDAR\n";
		
		return begin + body + end;
	}
};

module.exports = ical.create;
