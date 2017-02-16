/**
 * Created by cwilliams on 2/9/17.
 */
var nodemailer = require("nodemailer");
var AppConfig = require("../AppConfig");

var transport = AppConfig.email.transportConfig;
console.log('transport: ', transport);
var smtpTransport = nodemailer.createTransport(transport);

function sendMail(to, subject, text) {
	var mailOptions = {
		to: to,
		subject: subject,
		text: text
	};

	console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log(error);
			res.end("error");
		} else {
			console.log("Message sent: " + response.message);
			res.end("sent");
		}
	});
}


module.exports = {
	sendMail: sendMail
};