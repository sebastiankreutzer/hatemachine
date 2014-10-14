var Twit = require('twit');

var options = {
	mimetypes : {
		json : ["application/json", "application/json; charset=utf-8"]
	}
};

var twitter = new Twit({
		consumer_key : 'caML4PhhQAV7o86A6wjhF133m',
		consumer_secret : 'Pxla5g1V3okgWz8iy4udNebtkdEgYsFNAlSM2zj2g6ydB8jJwq',
		access_token : '2810337070-Gf3HcRK2tkHEY8R0ByVv1RhEjqIHgj0TaFHJZcH',
		access_token_secret : 'Snr68q7sbPpxrnd97TT4s2pYlXthweqARpTcPj863UV0S'
	});
	
console.log("Starting tweet deletion...");

twitter.get('statuses/user_timeline', {
	screen_name : 'gr8h8m8',
	count : 200
}, function (err, data, response) {
	var tweet;
	for (i = 0; i < data.length; i++) {
		tweet = data[i];
		twitter.post('statuses/destroy/:id', {
			id : tweet.id_str
		}, function (err, data, response) {
			console.log("Tweet deleted: " + data.text);
		});
	}
});
