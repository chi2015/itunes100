countries = {
	'gb':'UK',
	'us':'USA',
	'au':'Australia',
	'ca':'Canada',
	'nz':'New Zealand',
	'ru':'Russia'
}

function parseResponse(res) {
	var ret_str = 'Error connecting iTunes Feed';
	console.log('response', res);
	if (res.feed && res.feed.entry)
	{
		var top100 = res.feed.entry;
		ret_str = '<table><tr><th>No</th><th></th><th>Artist - Song</th><th></th></tr>';
		for (var i=0; i<top100.length; i++)
		{
			var n = i+1;
			ret_str += '<tr><td>' 
			+ n.toString() + '</td><td>'
			+ '<div onclick="previewTrack('+i+');" class="itunes-player play" id="player-'+i+'">'+
			'<audio class="itunes-audio" id="audio-'+i+'"' 
			+' type="'+top100[i]['link'][1]['attributes']['type']+'"'
			+' src="'+top100[i]['link'][1]['attributes']['href']+'"/>'
			+'</div></td><td>'
			+top100[i]['im:artist']['label'] + ' - ' 
			+ top100[i]['im:name']['label'] + 
			'</td><td><a title="Download in iTunes" href="'
			+top100[i]['id']['label']+'" class="dl_link"><img src="/itunes100/download.jpg"/></a></td></tr>';
		}
		
		ret_str += '</table>';
	}
	
	list.innerHTML = ret_str;
	playOneEvent(document.getElementsByClassName('itunes-audio'));
}

function loadList(country)
{
	if (!country)
	{
			list.innerHTML = "";
			return;
	}

	list.innerHTML = '<p class="load">Loading...</p>';
	if (document.getElementById("apple_script")) apple_script.remove();
	var as_el = document.createElement("script");
	as_el.id = "apple_script";
	as_el.type = "text/javascript";
	as_el.src = "https://itunes.apple.com/"+country+"/rss/topsongs/limit=100/explicit=true/json?callback=parseResponse";
	document.head.appendChild(as_el);
}

function initSelectCountry() {
	var choose_el = document.getElementById('choose');
	choose_el.innerHTML = '<option value="">Choose...</option>';
	for (var key in countries) {
		choose_el.innerHTML += '<option value="'+key+'">'+countries[key]+'</option>';
	}
}

function previewTrack(num) {
var el = document.getElementById('player-'+num), track = document.getElementById('audio-'+num);
if (el.className == "itunes-player play") {
    el.className = "itunes-player pause";
      	if (!track.paused) {
      		clearInterval(fadeAudioInterval);
      		track.pause();
      		track.volume=1;
            track.currentTime = 0;
      	}  
      	track.play();
  }
  else
  if (el.className == "itunes-player pause") {
  	el.className = "itunes-player play";
  	if (!track.paused) track.pause();
  }
}

function playOneEvent(audios) {
	for (var i=0; i<audios.length; i++) {
		audios[i].onplay = function(e) {
			for (var j=0; j<audios.length; j++)
				if (audios[j] != e.target && !audios[j].paused) {
					fadeAudio(audios[j]);
				}
		};
		audios[i].onended = function(e) {
			var track = e.target;
			track.currentTime = 0;
			var num = getTrackNum(track);
			previewTrack(num);
			previewTrack(num+1 >= audios.length ? 0 : num+1);
		}; 
		
		}
}

function getTrackNum(track) {
	return +track.id.substring(6);
}

function onEndTrackPlay(track, num, tracks_length) {
	        track.currentTime = 0;
			previewTrack(num);
			previewTrack(num+1 >= tracks_length ? 0 : num+1);
}

function fadeAudio(audio) {
	   fadeAudioInterval = setInterval(function () {
        audio.parentNode.className = "itunes-player play";
        if (audio.volume >= 0.1) audio.volume -= 0.1;
        // When volume at zero stop all the intervalling
        else {
            clearInterval(fadeAudioInterval);
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
        }
    }, 200);
}

window.onload = function() {
	
	initSelectCountry();
	for (var key in countries)
		Router.routes[key] = function() {
		  var choose_el = document.getElementById('choose');
		  choose_el.value = Router.route;
		  loadList(Router.route);
		};
		Router.routes["/"]
	Router.initRoute();
	window.addEventListener('popstate', function(event) {
	    Router.initRoute();
	});
}


var Router = {
  route : "",
  routes : {"/" : function() { loadList(""); var choose_el = document.getElementById('choose'); choose_el.value = ""; }},
  initRoute : function() {
       this.route = window.location.pathname.split("/")[2] || "/";
       if (this.route && this.routes[this.route]) this.routes[this.route]();
  },
  go : function(url) {
       if (!url) url = "/itunes100";
       history.pushState({foo : "bar"}, "iTunes Top 100", url);
       this.route = url;
       if (this.routes[url]) this.routes[url](); else this.routes["/"]();
  }
};

