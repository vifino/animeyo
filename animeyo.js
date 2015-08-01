// Anime yo!
// Scrapes kissanime.com and returns download links.
var inquirer = require("inquirer"),
		cloudscraper = require("cloudscraper"),
		_anime = require('anime-scraper'),
		Anime = _anime.Anime,
		AnimeUtils = _anime.AnimeUtils,
		googl = require('goo.gl')

googl.setKey("AIzaSyB3rh1o1g5PRkaPldxW-laX-12e7mhZ5Tg") // Found somewhere.

// Defaults.
var nourl = "No video found with specified resolution.",
		format = "list",
		res = '1080p',
		doshorten = true,
		questions = [
	{
		name: "querytype",
		type: "list",
		message: "Choose how you'll provide the Anime:",
		choices: [
			"Search",
			"URL"
		],
		default: "Search",
		filter: function( val ) { return val.toLowerCase(); }
	},
	{
		name: "anime",
		type: "input",
		message: "What Anime to grab download links for?"
	},
	{
		name: "res",
		type: "list",
		message: "What resolution do you want: (Availability varies on Anime)",
		choices: [
			'1080p',
			'720p',
			'360p'
		],
		default: res,
		filter: function( val ) { return val.toLowerCase(); }
	},
	{
		name: "format",
		type: "list",
		message: "What format do you want?",
		choices: [
			"Plain List",
			"WGet Commands",
			"cURL Commands",
			"WGet Commands OneLiner",
			"cURL Commands OneLiner",
		],
		default: "Plain List",
		filter: function( val ) { return val.toLowerCase(); }
	},
	{
		name: "shorten",
		type: "confirm",
		message: "Shorten URL with goo.gl?",
		default: doshorten,
	}
]

// Main logic, used later.
function main(anime) {
	anime.getVideoUrls().then(function(results) {
		for (n in results) {
			ep = results[n]
			url = nourl
			urls = ep.videoUrls
			for (l in urls) {
				u = urls[l]
				if (u.name == res) {
					if (doshorten) {
						shorten(ep.name, u.url)
					} else {
						output(ep.name, u.url)
					}
					break
				}
			}
		}
		//console.log(results)
	})
}

function output(name, url) {
	name = name.replace("Episode", "-")
	switch(format) {
		case "plain list":
			console.log(name + ":", url)
			break
		case "wget commands":
			if (url != nourl)
				console.log("wget " + url + " -O '" + name + "'")
			break
		case "curl commands":
			if (url != nourl)
				console.log("curl " + url + " -o '" + name + "'")
			break
		case "wget commands oneliner":
			if (url != nourl)
				process.stdout.write("wget " + url + " -O '" + name + ".mp4'; ")
			break
		case "curl commands oneliner":
			if (url != nourl)
				process.stdout.write("curl " + url + " -o '" + name + ".mp4'; ")
			break
	}
}

function shorten(name, url) {
	googl.shorten(url).then(function(shortened){
		output(name, shortened)
	})
	.catch(function(err){
		console.error(err.message);
	})
}

// Generate cloudflare auth token.
function grab(querytype, q) {
	cloudscraper.get('http://kissanime.com', function(err, body, resp) {
		var cookieString = resp.request.headers.cookie
		AnimeUtils.setSessionCookie(cookieString)
		if (querytype=="url") {
			Anime.fromUrl(q).then(main)
		} else {
			Anime.fromName(q).then(main)
		}
	})
}

if (!process.argv[3]) {
	inquirer.prompt( questions, function( answers ) {
		doshorten = answers["shorten"]
		format = answers["format"]
		res = answers["res"].toString()
		process.stdout.write("\n")
		grab(answers["querytype"], answers["anime"])
	});
} else {
	grab("url", process.argv[3], process.argv[2], process.argv[4].to_lower == "yes" )
}
