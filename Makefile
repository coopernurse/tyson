
all:
	jshint example/vendor/tyson.js
	cp example/vendor/tyson.js .
	uglifyjs tyson.js > tyson.min.js
