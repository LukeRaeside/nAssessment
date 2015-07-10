var readline = require('readline'),
	encryptor = require('./routes/core/encryptor.js').Encryptor;

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question("Please enter the text to encrypt or 'q' to quit: ", processAnswer);

function processAnswer(answer) {
	if ("q" == answer) {
		console.log("bye");
		rl.close();
		process.exit(0);
	} else {
		var encryptor = new Encryptor();
		var encrypted = encryptor.encrypt(answer);
		console.log(encrypted);
		rl.question("Please enter the text to encrypt or 'q' to quit: ", processAnswer);
	}
}
