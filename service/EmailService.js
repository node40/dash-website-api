/**
 * Created by cwilliams on 2/9/17.
 */

var smtpTransport = nodemailer.createTransport("SMTP",{
	service: "Gmail",
	auth: {
		user: "",
		pass: ""
	}
});

function sendMail(to, subject, text)
var mailOptions={
	to : req.query.to,
	subject : req.query.subject,
	text : req.query.text
}
console.log(mailOptions);
smtpTransport.sendMail(mailOptions, function(error, response){
	if(error){
		console.log(error);
		res.end("error");
	}else{
		console.log("Message sent: " + response.message);
		res.end("sent");
	}
});


module.exports = {

}