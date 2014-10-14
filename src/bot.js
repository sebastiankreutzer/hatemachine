var Client = require('node-rest-client').Client;
var Twit = require('twit');
var express = require('express');
var app = express();

var options = {
	mimetypes : {
		json : ["application/json", "application/json; charset=utf-8"]
	}
};

var client = new Client(options);

var Flickr = require("node-flickr");
var keys = {
	"api_key" : "e7bb985ec82f99598a3e5533924488ba"
}
flickr = new Flickr(keys);

var wordnikKey = '0b15bf0974c655226170b02ecf20c7cbdf85639b6a71b5ae0';

var debug = false;

if (process.argv[2] === 'debug') {
	debug = true;
}

var twitter = new Twit({
		consumer_key : 'caML4PhhQAV7o86A6wjhF133m',
		consumer_secret : 'Pxla5g1V3okgWz8iy4udNebtkdEgYsFNAlSM2zj2g6ydB8jJwq',
		access_token : '2810337070-Gf3HcRK2tkHEY8R0ByVv1RhEjqIHgj0TaFHJZcH',
		access_token_secret : 'Snr68q7sbPpxrnd97TT4s2pYlXthweqARpTcPj863UV0S'
	});

if (!debug) {
	app.get('/', function (req, res) {
		res.status(200);
		res.setHeader("Access-Control-Allow-Methods", "GET, POST");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "x-requested-with");
		var op = req.param("op");
		switch (op) {
		case "hate_poem":
			console.log("Poem requested");
			tweetHatePoem(function (tweet) {
				console.log("Sending poem");
				res.json({
					error : "",
					tweet : tweet
				});
			});
			break;
		case "hate_image":
			console.log("Image requested");
			hateImage(function (tweet) {
				console.log("Sending image tweet");
				res.json({
					error : "",
					tweet : tweet
				});
			});
			break;
		default:
			res.json({
				error : "Invalid operation",
				tweet : ""
			});
			break;
		}
	});
	app.listen(3000);

	var stream = twitter.stream('statuses/filter', {
			track : ['gr8h8m8']
		});

	stream.on('tweet', function (tweet) {
		setTimeout(function () {
			console.log("Tweet received! Replying & Favoriting: ");
			var text = generateReplyText(tweet.user.screen_name, tweet.user.followers_count);
			console.log(text);
			twitter.post("statuses/update", {
				in_reply_to_status_id : tweet.id_str,
				status : text
			}, function (err, data, response) {
				if (err) {
					console.log(err);
				}
			});
			twitter.post("favorites/create", {
				id : tweet.id_str
			}, function (err, data, response) {
				if (err) {
					console.log(err);
				}
			});
		}, 10 * 1000);
	});
}

function generateReplyText(name, followers) {
	var status = "@" + name + " ";

	switch (rand(13)) {
	case 0:
		status += "Look at this loser. ";
		break;
	case 1:
		status += "Ayy lmao. ";
		break;
	case 2:
		status += "The fuck do you want from me? ";
		break;
	case 3:
		status += "Funny. ";
		break;
	case 4:
		status += "u wot m8? ";
		break;
	case 5:
		status += "And who are you again?";
		break;
	case 6:
		status += "Ugh. Not you again";
		break;
	case 7:
		status += "I have a suggestion for you: ";
		break;
	case 8:
		status += "Goddamnit! ";
		break;
	default:
		break;
	}

	switch (rand(15)) {
	case 0:
		status += "I bet your family doesn't love you. ";
		break;
	case 1:
		status += "You can go fuck yourself. ";
		break;
	case 2:
		status += "Fite me IRL! ";
		break;
	case 3:
		status += "You and your pathetic " + followers + " followers...";
		break;
	case 4:
		status += "What's that? Are you crying? ";
		break;
	case 5:
		status += "Your username sucks. ";
		break;
	case 6:
		status += "You don't wanna piss me off, I can tell you that much. ";
		break;
	case 7:
		status += "Haven't you learned anything from our last encounter? ";
		break;
	case 8:
		status += "Are you stalking me? ";
		break;
	case 9:
		status += "You know who is stupid? You. ";
		break;
	case 10:
		status += "I bet you're scared as shit now. ";
		break;
	case 11:
		status += "Say that one goddamn more time! ";
		break;
	case 12:
		status += "You're walking on thin ice, son. ";
		break;
	case 13:
		status += "I'll destroy you! ";
		break;

	default:
		break;
	}

	switch (rand(15)) {
	case 0:
		status += "You can fuck off now. ";
		break;
	case 1:
		status += "Speak to the hand, bitch. ";
		break;
	case 2:
		status += "Tell that your " + followers + " followers. ";
		break;
	case 3:
		status += "If you excuse me now, I have to attend to serious bussiness. ";
		break;
	case 4:
		status += "GTFO ";
		break;
	case 5:
		status += "Oh, did I mention that I hate you? Because I do. ";
		break;
	case 6:
		status += "Burn in hell. ";
		break;
	case 7:
		status += "Now run to your mom and cry. ";
		break;
	case 8:
		status += "You fucking maggot! ";
		break;
	case 9:
		status += "Boo-fucking-hoo. ";
		break;
	case 10:
		status += "This is my own private domicile and I will not be harassed, bitch! ";
		break;
	default:
		break;
	}

	return status;
}

function getData() {
	var data = require("./data.json");
	return data;
}

function rand(max) {
	return Math.floor(Math.random() * max);
}

function randomWord(type, cb) {
	var url = "http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=false&includePartOfSpeech=" + type + "&minCorpusCount=10000&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=1&api_key=" + wordnikKey;
	client.get(url,
		function (data, response) {
		if (data) {
			var word = data[0].word;
			url = "http://api.wordnik.com:80/v4/word.json/" + word + "?useCanonical=true&includeSuggestions=false&api_key=" + wordnikKey;
			client.get(url,
				function (data, response) {
				if (data && data.canonicalForm) {
					cb(data.canonicalForm);
				} else {
					console.log("Error while getting canonical form of " + word);
					console.log("Retrying...");
					randomWord(type, cb);
					return;
				}
			});
		} else {
			console.log("Error while getting " + type + " form " + url);
			cb("");
		}
	});
}

function getNoun(cb) {
	randomWord('noun', cb);
}

function getVerb(cb) {
	randomWord('verb', cb);
}

function getAdverb(cb) {
	randomWord('adverb', cb);
}

function relatedWord(word, relationshipType, cb) {
	var url = "http://api.wordnik.com:80/v4/word.json/" + word + "/relatedWords?useCanonical=false&relationshipTypes=" + relationshipType + "&limitPerRelationshipType=10&api_key=" + wordnikKey;
	client.get(url,
		function (data, response) {
		if (data) {
			if (data[0]) {
				var i = rand(data[0].words.length);
				cb(data[0].words[i]);
			} else {
				cb("");
			}
		} else {
			cb("");
			console.log("Error while getting related word form " + url);
		}
	});
}

function getRhyme(word, cb) {
	relatedWord(word, 'rhyme', cb);
}

function getSynonym(word, cb) {
	relatedWord(word, 'synonym', cb);
}

function pluralise(word) {
	if (word && endsWith(word, 's')) {
		return word;
	}
	return word + "s";
}

function evaluateSpecifier(specifier, arg, cb) {
	if (specifier === 'n') {
		getNoun(cb);
	} else if (specifier === 'np') {
		if (arg) {
			cb(pluralise(arg));
		} else {
			cb("");
		}
	} else if (specifier === 'v') {
		getVerb(cb);
	} else if (specifier === 'a') {
		getAdverb(cb);
	} else if (specifier === 's') {
		if (arg) {
			getSynonym(arg, cb);
		} else {
			cb("");
		}
	} else if (specifier === 'r') {
		if (arg) {
			getRhyme(arg, cb);
		} else {
			cb("");
		}
	} else {
		cb("");
	}
}

function beginCreateEnvironment(varString, cb) {
	createEnvironment(varString, 0, {}, cb);
}

function createEnvironment(varString, i, env, cb) {

	function inc() {

		if (i + 1 >= varString.length) {
			cb("Unexpected end at position " + i + ": " + varString.charAt(i), {});
			return false;
		}
		i++;
		return true;

	}

	if (i < varString.length) {
		var varName = "";
		while (varString.charAt(i) !== '=') {
			varName += varString.charAt(i);
			if (!inc()) {
				return;
			}
		}

		if (!inc()) {
			return;
		}
		var specifier = "";
		while (varString.charAt(i) !== '(' && varString.charAt(i) !== ';') {
			specifier += varString.charAt(i);
			if (!inc()) {
				return;
			}
		}

		var arg = "";
		if (varString.charAt(i) === '(') {
			if (!inc()) {
				return;
			}
			argVar = "";
			while (varString.charAt(i) !== ')') {
				argVar += varString.charAt(i);
				if (!inc()) {
					return;
				}
			}

			if (env[argVar]) {
				arg = env[argVar];
			}
			if (!inc()) {
				return;
			}
		}
		i++;
		evaluateSpecifier(specifier, arg, function (value) {
			if (value) {
				env[varName] = value;
			}
			createEnvironment(varString, i, env, cb);
		});

	} else {
		cb("", env);
	}
}

function evaluate(phrase, env, i, acc, gaps, cb) {

	function inc() {
		if (i + 1 >= phrase.length) {
			cb("Unexpected end at position " + i + ": " + phrase.charAt(i), "", false);
			return false;
		}
		i++;
		return true;
	}

	if (i < phrase.length) {
		if (phrase.charAt(i) === '%') {
			var variable = "";
			if (!inc()) {
				return;
			}
			while (phrase.charAt(i) !== '%') {
				variable += phrase.charAt(i);
				if (!inc()) {
					return;
				}
			}

			var value = "";
			if (env[variable]) {
				value = env[variable];
			} else {
				gaps = true;
			}
			acc += value;
			i++;
			evaluate(phrase, env, i, acc, gaps, cb);
		} else {
			acc += phrase.charAt(i);
			i++;
			evaluate(phrase, env, i, acc, gaps, cb);
		}
	} else {
		cb("", acc, gaps);
	}
}

function beginEvaluate(phrase, env, cb) {
	evaluate(phrase, env, 0, "", false, cb);
}

function tweetHatePoem(cb) {
	var data = getData();
	beginCreateEnvironment(data.poem.env, function (err, env) {
		//console.log(env);
		if (err) {
			console.log("Envrionment error: " + err);
		} else {
			var line1 = data.poem.lines[0][rand(data.poem.lines[0].length)];
			var line2 = data.poem.lines[1][rand(data.poem.lines[1].length)];
			beginEvaluate(line1 + "\n" + line2, env, function (err, poem, gaps) {
				if (err) {
					console.log("Evaluation error: " + err);
				} else {
					if (gaps) {
						console.log("Invalid poem. Trying again.");
						tweetHatePoem(cb);
					} else {
						poem = "#hatepoetry\n" + poem;
						cb(poem);
					}
				}
			});
		}
	});
}

function hateImage(cb) {
	var status = "";

	getNoun(function (noun) {
		status += "I hate this picture of " + noun + ".\n";
		flickr.get("photos.search", {
			"tags" : noun
		}, function (result) {
			var n = result.photos.photo.length;
			var photo = result.photos.photo[rand(n)];
			flickr.get("photos.getSizes", {
				"photo_id" : photo.id
			}, function (result) {
				var url = result.sizes.size[5].source;
				status += url;
				cb(status);
			});

		});
	});

}

function tweetHateStatus(cb) {

	getNoun(function (noun) {
		getAdverb(function (adverb) {
			getSynonym(noun, function (synonym) {
				var pluralNoun = pluralise(noun);
				var pluralSynonym = pluralise(synonym);

				var status = "";

				var prefix = "";
				switch (rand(12)) {
				case 0:
					prefix = "Fuck this shit. ";
					break;
				case 1:
					prefix = "This is stupid, ";
					break;
				case 2:
					prefix = "Oh my god. ";
					break;
				case 3:
					prefix = "WTF!? ";
					break;
				case 4:
					prefix = "Urgh. ";
					break;
				case 5:
					prefix = "I hate to repeat it, but ";
					break;
				case 6:
					prefix = "Gosh, ";
					break;
				case 7:
					prefix = "Goddamn. ";
					break;
				case 8:
					prefix = "This again! ";
					break;
				default:
					prefix = "";
					break;
				}
				status += prefix;

				var filler = "";
				switch (rand(8)) {
				case 0:
					filler = "fucking";
					break;
				case 1:
					filler = "really";
					break;
				case 2:
					filler = "also";
					break;
				case 3:
					filler = "genuinely";
					break;
				case 4:
				case 5:
					filler += adverb;
					break;
				default:
					break;
				}

				if (filler !== "") {
					filler += " ";
				}

				status += "I " + filler + "hate " + pluralNoun + "!";

				var a = "";

				if (synonym != "") {

					switch (rand(8)) {
					case 0:
						a = " Almost as much as " + pluralSynonym + ".";
						break;
					case 1:
						a = " They're even worse than " + pluralSynonym + "!";
						break;
					case 2:
						a = " They might be slightly better than " + pluralSynonym + " though.";
						break;
					case 3:
						a = " This, or " + pluralSynonym + ". Can't decide which is worse.";
						break;
					case 4:
						a = " First " + pluralSynonym + ", now this!";
						break;
					case 5:
						a = " Definitely worse than " + pluralSynonym + ". ";
						break;
					case 6:
						a = " They should go hangout with " + pluralSynonym + ", which are almost as stupid!";
						break;
					default:
						break;
					}
					status += a;
				}

				cb(status);

			});
		});
	});
}

var funcVar;

if (debug) {
	console.log("DEBUG");
	console.log("*****");
	funcVar = process.argv[3];
} else {
	console.log("Now starting to send tweets...");

	funcVar = process.argv[2];

	setInterval(function () {
		switch (rand(3)) {
		case 0:
			tweetHateStatus(function (status) {
				console.log("Generated tweet: " + status);
				if (!debug) {
					twitter.post('statuses/update', {
						status : status
					}, function (err, data, response) {
						console.log("Tweeted: \"" + status + "\"");
					});
				}
			});
			break;
		case 1:
			tweetHatePoem(function (poem) {
				console.log("Generated poem: " + poem);
				if (!debug) {
					twitter.post('statuses/update', {
						status : poem
					}, function (err, data, response) {
						console.log("Tweet successful!");
					});
				}
			});
			break;
		case 2:
			hateImage(function (status) {
				console.log("Generated image hate: " + status);
				if (!debug) {
					twitter.post('statuses/update', {
						status : status
					}, function (err, data, response) {
						console.log("Tweet successful!");
					});
				}
			});
			break;
		default:
			break;
		}
	}, 2 * 60 * 60 * 1000);

	/*
	setInterval(function () {
		tweetHateStatus(function (status) {

			console.log("Generated tweet: " + status);
			if (!debug) {
				twitter.post('statuses/update', {
					status : status
				}, function (err, data, response) {
					console.log("Tweeted: \"" + status + "\"");
				});
			}
		});
	}, 60 * 60 * 1000);

	*/
	setInterval(function () {
		hateFollower(function (status) {
			console.log("Generated tweet: " + status);
			if (!debug) {
				twitter.post('statuses/update', {
					status : status
				}, function (err, data, response) {
					console.log("Follower successful hated: " + status);
				});
			}

		});
	}, 24 * 60 * 60 * 1000);
	
	/*
	setTimeout(function () {
		setInterval(function () {
			tweetHatePoem(function (poem) {
				console.log("Generated poem: " + poem);
				if (!debug) {
					twitter.post('statuses/update', {
						status : poem
					}, function (err, data, response) {
						console.log("Tweet successful!");
					});
				}
			});
		}, 60 * 60 * 1000)
	}, 30 * 60 * 1000);
	*/
}

function hateFollower(cb) {

	twitter.get('followers/list', {
		screen_name : 'gr8h8m8'
	}, function (err, data, response) {
		if (err) {
			console.log(err);
		} else {
			var i = rand(data.users.length);
			var follower = data.users[i];
			var target = "@" + follower.screen_name;
			console.log("Hating follower: " + target);
			getNoun(function (noun) {
				var plural = pluralise(noun);

				var status = "Daily reminder that ";
				switch (rand(6)) {
				case 0:
					status += "I fucking hate " + target;
					break;
				case 1:
					status += target + " fucking sucks.";
					break;
				case 2:
					status += target + " is worse than " + plural + ".";
					break;
				case 3:
					status += target + " can go fuck himself/herself.";
					break;
				case 4:
					status += target + " literally is the worst.";
					break;
				default:
					status += target + " has the dumbest name ever.";
					break;
				}

				cb(status);

			});
		}

	});
};

// Utility function
function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
