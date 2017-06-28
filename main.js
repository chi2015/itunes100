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
	if (res.feed && res.feed.entry)
	{
		var top100 = res.feed.entry;
		ret_str = '<table><tr><th>No</th><th>Artist - Song</th><th></th></tr>';
		for (var i=0; i<top100.length; i++)
		{
			var n = i+1;
			ret_str += '<tr><td>' + n.toString() + '</td><td>'+top100[i]['im:artist']['label'] + ' - ' + top100[i]['im:name']['label'] + '</td><td><a title="Download in iTunes" href="'+top100[i]['id']['label']+'" class="dl_link"><img src="/itunes100/download.jpg"/></a></td></tr>';
		}
		
		ret_str += '</table>';
	}
	
	list.innerHTML = ret_str;
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

