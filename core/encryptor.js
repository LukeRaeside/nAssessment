
var crypto = require('crypto');

Encryptor = function(algorithm, key, inputEncoding, outputEncoding) {
	var self = this;
	
	if (algorithm) { this.agorithm = algorithm; }
	else {this.algorithm = "aes-128-cbc"; }
	
	if (key) { this.key = key; }
	else { this.key = "mysecretkey"; }
	
	if (inputEncoding) { this.inputEncoding = inputEncoding; }
	else { this.inputEncoding = "utf8"; }
	
	if (outputEncoding) { this.outputEncoding = outputEncoding; }
	else { this.outputEncoding = "hex"; }
};

Encryptor.prototype.encrypt = function(plaintext) {
	var cipher = crypto.createCipher(this.algorithm, this.key);
	var cipherChunks = [];
	cipherChunks.push(cipher.update(plaintext, this.inputEncoding, this.outputEncoding));
	cipherChunks.push(cipher.final(this.outputEncoding));
	
	return cipherChunks.join('');
};

Encryptor.prototype.decrypt = function(cipheredtext) {
	var decipher = crypto.createDecipher(this.algorithm, this.key);
	var decipherChunks = [];
	decipherChunks.push(decipher.update(cipheredtext, this.outputEncoding, this.inputEncoding));
	decipherChunks.push(decipher.final(this.inputEncoding));
	
	return decipherChunks.join('');
};

Encryptor.prototype.generateRandomPassword = function(chars, pwdLength) {
	var password = '';
	
	for (var i=0; i<pwdLength; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		password += chars.substring(rnum,rnum+1);
	}
	return password;
};

exports.Encryptor = Encryptor;
