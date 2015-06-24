Date.prototype.format = function() {
	// 20150623T190000Z
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var datePart = yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
	   var timePart = this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
   return datePart + 'T' + timePart;
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
DTSTAMP:19971201T130000\n\
UID:ksi@ksi.is\n\
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