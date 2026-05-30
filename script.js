var SPEED = 0.0084;
var CAMERA_LAG = 0.9;
var COLLISION = 1.1;
var BOUNCE = 0.2;
var mapscale = 5;
var VR = false;
var BOUNCE_CORRECT = 0.01;
var WALL_SIZE = 1.2;
var MOUNTAIN_DIST = 450;
var OOB_DIST = 500;
var LAPS = 3;

var BOOST_STRENGTH = 0.0093; 
var BOOST_RECHARGE_TIME = 8250; 
var BOOST_DRAIN_TIME = 4000;

var BRAKE_POWER = 0.97;
var BRAKE_REVERSE = 0.0009;

var CLUTCH_FRICTION = 2.975; // Decel rate while clutch held (lower = stops faster, higher = coasts longer; between BRAKE_POWER and 0.99)

// Count number of set bits in a bitmask (used for checkpoint progress)
function countBits(n){ var c = 0; while(n){ c += n & 1; n >>= 1; } return c; }
function MODS(){

}

// ===== UNIQUE PC ID =====
// Each browser gets a persistent unique ID stored in localStorage.
// This lets the DB track distinct machines across sessions.
var PC_ID = (function(){
	var key = "roller_pc_id";
	var id = localStorage.getItem(key);
	if(!id){
		// Generate a random 16-char hex ID
		id = "";
		for(var i = 0; i < 16; i++)
			id += Math.floor(Math.random()*16).toString(16);
		localStorage.setItem(key, id);
	}
	return id;
})();

var serverList = [
	{
		apiKey: "AIzaSyCJHdK7KfqvyQ-gwvVbSNE69PHSDnWvXpo",
		authDomain: "github-racing.firebaseapp.com",
		databaseURL: "https://github-racing-default-rtdb.asia-southeast1.firebasedatabase.app",
		projectId: "github-racing",
		storageBucket: "github-racing.firebasestorage.app",
		messagingSenderId: "979171326010",
		appId: "1:979171326010:web:25b60c1cbd2d1017f49d03",
		measurementId: "G-JF1TMMQ2NQ"
	},
	{
		apiKey: "AIzaSyDiJsMLlix5o9XqPW1EpeBvuA15XNjlR8M",
		authDomain: "car-game-a86b9.firebaseapp.com",
		databaseURL: "https://car-game-a86b9.firebaseio.com",
		projectId: "car-game-a86b9",
		storageBucket: "car-game-a86b9.appspot.com",
		messagingSenderId: "722396856191",
		appId: "1:722396856191:web:fb5f72917856108a50e44a"
	},
	{
		apiKey: "AIzaSyCsqpn0aTDqU8ffGVE284fmSEOTK2tOgq8",
		authDomain: "car-game-backup.firebaseapp.com",
		databaseURL: "https://car-game-backup.firebaseio.com",
		projectId: "car-game-backup",
		storageBucket: "car-game-backup.appspot.com",
		messagingSenderId: "1015722732476"
	},
	{
		apiKey: "AIzaSyDNuMPH_bg8Orkndl8Md6lUh_EOS3pitGs",
		authDomain: "car-game-backup-2.firebaseapp.com",
		databaseURL: "https://car-game-backup-2-default-rtdb.firebaseio.com",
		projectId: "car-game-backup-2",
		storageBucket: "car-game-backup-2.appspot.com",
		messagingSenderId: "250860288006",
		appId: "1:250860288006:web:9df8ed3929e7fceb2d2b87"
	},
	{
		apiKey: "AIzaSyCmfz7RvzLaAo4xIxA-sH3qhXuGQZYMuvE",
		authDomain: "car-game-backup-3.firebaseapp.com",
		databaseURL: "https://car-game-backup-3-default-rtdb.firebaseio.com",
		projectId: "car-game-backup-3",
		storageBucket: "car-game-backup-3.appspot.com",
		messagingSenderId: "477326457153",
		appId: "1:477326457153:web:421821136bcc6a67f149c0"
	},
	{
		apiKey: "AIzaSyAerrEq1YUJNZnvQhZvyRa6LOS9VyhEYvs",
		authDomain: "car-game-backup-4.firebaseapp.com",
		databaseURL: "https://car-game-backup-4-default-rtdb.firebaseio.com",
		projectId: "car-game-backup-4",
		storageBucket: "car-game-backup-4.appspot.com",
		messagingSenderId: "802151922986",
		appId: "1:802151922986:web:69b9ff0ad8778d51da7253"
	},
	{
		apiKey: "AIzaSyCdVFLbMypdHR60NqXYs_qSpAdvvgpo9Ig",
		authDomain: "car-game-backup-5.firebaseapp.com",
		databaseURL: "https://car-game-backup-5-default-rtdb.firebaseio.com",
		projectId: "car-game-backup-5",
		storageBucket: "car-game-backup-5.appspot.com",
		messagingSenderId: "743331533949",
		appId: "1:743331533949:web:a724977f309c1583400d14"
	},
	{
		apiKey: "AIzaSyDRmEJMfrk_y1-BLjgaD6ctaDfP8tKSyfA",
		authDomain: "car-game-backup-6.firebaseapp.com",
		databaseURL: "https://car-game-backup-6-default-rtdb.firebaseio.com",
		projectId: "car-game-backup-6",
		storageBucket: "car-game-backup-6.appspot.com",
		messagingSenderId: "1025140224576",
		appId: "1:1025140224576:web:cb239ab3773cb7596125a5"
	},
	{
		apiKey: "AIzaSyA1y6TdFz2F0oahE-HmkA0mTAROlgIytR4",
		authDomain: "car-game-backup-7.firebaseapp.com",
		databaseURL: "https://car-game-backup-7-default-rtdb.firebaseio.com",
		projectId: "car-game-backup-7",
		storageBucket: "car-game-backup-7.appspot.com",
		messagingSenderId: "1012238241918",
		appId: "1:1012238241918:web:d4188393dcd596b6a6882f"
	}
];

var database, connectedN = -1, connectedS = undefined;
for(var i = 0; i < serverList.length; i++){
	firebase.initializeApp(serverList[i], "server" + i);
	let li = i;
	let la = firebase.apps[i];
	if(i == 0){
		try{
			la.analytics();
		}catch{}
	}
    	let tm = setTimeout(function(){
    	    la.delete();
    	}, 5000);
	la.auth().signInAnonymously().then(() => {
		database = la.database();
		database.ref("/testServer").once("value", function(e){
            		clearTimeout(tm);
			if(connectedN >= 0 && connectedN > li)
				connectedS.delete();
			if(connectedN < 0 || connectedN > li){
				database = la.database();
				connectedN = li;
				connectedS = la;
			}else{
				la.delete();
			}
		}, function(e){
			la.delete();
		});
	}, function(e){
		la.delete();
	});
}

/*var config = {
	apiKey: "AIzaSyDiJsMLlix5o9XqPW1EpeBvuA15XNjlR8M",
	authDomain: "car-game-a86b9.firebaseapp.com",
	databaseURL: "https://car-game-a86b9.firebaseio.com",
	projectId: "car-game-a86b9",
	storageBucket: "car-game-a86b9.appspot.com",
	messagingSenderId: "722396856191",
	appId: "1:722396856191:web:fb5f72917856108a50e44a"
}*/


setTimeout(function(){
	document.getElementById("title").style.transform = "none";
}, 500);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[0].style.transform = "none";
}, 1000);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[1].style.transform = "none";
}, 1200);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[2].style.transform = "none";
}, 1400);
setTimeout(function(){
	document.getElementById("mywebsitelink").style.transform = "none";
}, 1600);
setTimeout(function(){
	document.getElementById("settings").style.transform = "none";
}, 1800);
/*var connected = -1;
/*var config = {
	apiKey: "AIzaSyDiJsMLlix5o9XqPW1EpeBvuA15XNjlR8M",
	authDomain: "car-game-a86b9.firebaseapp.com",
	databaseURL: "https://car-game-a86b9.firebaseio.com",
	projectId: "car-game-a86b9",
	storageBucket: "car-game-a86b9.appspot.com",
	messagingSenderId: "722396856191"
};
firebase.initializeApp(config);
var database = firebase.database();
try{
	firebase.analytics();
}catch(e){ console.log("Analytics were blocked :("); }


database.ref("/testServer").once("value", function(e){
	if(connected < 0 || connected > 0){
		database = firebase.apps[0].database();
		connected = 0;
	}
});

config = {
	apiKey: "AIzaSyCsqpn0aTDqU8ffGVE284fmSEOTK2tOgq8",
	authDomain: "car-game-backup.firebaseapp.com",
	databaseURL: "https://car-game-backup.firebaseio.com",
	projectId: "car-game-backup",
	storageBucket: "car-game-backup.appspot.com",
	messagingSenderId: "1015722732476"
};
firebase.initializeApp(config, "backup");
database = firebase.apps[1].database();
database.ref("/testServer").once("value", function(e){
	if(connected < 0 || connected > 1){
		database = firebase.apps[1].database();
		connected = 1;
	}
});

config = {
	apiKey: "AIzaSyDNuMPH_bg8Orkndl8Md6lUh_EOS3pitGs",
	authDomain: "car-game-backup-2.firebaseapp.com",
	databaseURL: "https://car-game-backup-2-default-rtdb.firebaseio.com",
	projectId: "car-game-backup-2",
	storageBucket: "car-game-backup-2.appspot.com",
	messagingSenderId: "250860288006",
	appId: "1:250860288006:web:9df8ed3929e7fceb2d2b87"
};
firebase.initializeApp(config, "backup2");
database = firebase.apps[2].database();
database.ref("/testServer").once("value", function(e){
	if(connected < 0 || connected > 2){
		database = firebase.apps[2].database();
		connected = 2;
	}
});

config = {
	apiKey: "AIzaSyCmfz7RvzLaAo4xIxA-sH3qhXuGQZYMuvE",
	authDomain: "car-game-backup-3.firebaseapp.com",
	databaseURL: "https://car-game-backup-3-default-rtdb.firebaseio.com",
	projectId: "car-game-backup-3",
	storageBucket: "car-game-backup-3.appspot.com",
	messagingSenderId: "477326457153",
	appId: "1:477326457153:web:421821136bcc6a67f149c0"
};
firebase.initializeApp(config, "backup3");
database = firebase.apps[3].database();
database.ref("/testServer").once("value", function(e){
	if(connected < 0 || connected > 3){
		database = firebase.apps[3].database();
		connected = 3;
	}
});

config = {
	apiKey: "AIzaSyAerrEq1YUJNZnvQhZvyRa6LOS9VyhEYvs",
	authDomain: "car-game-backup-4.firebaseapp.com",
	projectId: "car-game-backup-4",
	storageBucket: "car-game-backup-4.appspot.com",
	messagingSenderId: "802151922986",
	appId: "1:802151922986:web:69b9ff0ad8778d51da7253"
};
firebase.initializeApp(config, "backup4");
database = firebase.apps[4].database();
database.ref("/testServer").once("value", function(e){
	if(connected < 0 || connected > 4){
		database = firebase.apps[4].database();
		connected = 4;
	}
}); */

if(top != self) {
	document.getElementById("warning").style.display = "block";
}

function forceScroll(){
	requestAnimationFrame(forceScroll);
	window.scrollTo(0, 0);
}
forceScroll();

//var database = firebase.database();

var camera, renderer, scene, renderer2, scene2, labels = [];
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
var mobile = navigator.userAgent.match("Mobile")!=null||navigator.userAgent.match("Linux;")!=null;
if(!mobile){
	renderer.shadowMap.enabled = false;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.getElementById("cardboard").className += " disabled";
	console.log(mobile);
}
var element = renderer.domElement;

function toggleFullScreen() {
	var doc = window.document;
	var docEl = doc.documentElement;

	var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
	var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

	if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl);
	}
	else {
		cancelFullScreen.call(doc);
	}
	window.scrollTo(0,1);
}

var name, code, players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, braking = false, boostHeld = false, boostTank = 100, lap;
var clutch = false; // Clutch pedal: disengages engine (no accel) and slowly decelerates
var carPos = [
	{x: 0, y: 0},
	{x: 2, y: 0},
	{x: -2, y: 0},
	{x: 0, y: -3},
	{x: -2, y: -3},
	{x: 2, y: -3},
	{x: 0, y: -6},
	{x: 2, y: -6},
	{x: -2, y: -6},
	{x: 0, y: -9},
	{x: 2, y: -9},
	{x: -2, y: -9},
	{x: 0, y: -12},
	{x: -2, y: -12},
	{x: 2, y: -12},
	{x: 0, y: -15},
	{x: 2, y: -15},
	{x: -2, y: -15}
];
color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");
updateColor = function(){
	s.style.marginLeft = color / 360 * 80 + "vw";
	s.style.backgroundColor = "hsl(" + color + ", 100%, 50%)";
	document.body.style.backgroundColor = "hsl(" + color + ", 50%, 50%)";
}
updateColor();

menu2 = function(){
	if(mobile){
		function reactOrientation(e){
			var angle = screen.orientation.type == "portrait-primary" ? e.gamma : screen.orientation.type == "portrait-secondary" ? -e.gamma : screen.orientation.type == "landscape-primary" ? e.beta : screen.orientation.type == "landscape-secondary" ? -e.beta : 0;
			me.data.steer = Math.max(Math.min((-angle) / 180 * Math.PI, Math.PI / 6), -Math.PI / 6);
		}

		if(DeviceOrientationEvent.requestPermission){
			DeviceOrientationEvent.requestPermission("The game needs to access phone tilt so you can steer your car.").then(permissionState => {
				if (permissionState === 'granted')
					window.addEventListener('deviceorientation', reactOrientation);
				else
					alert("Permission denied");
			}).catch(alert);
    		}else{
			window.addEventListener('deviceorientation', reactOrientation);
		}
	}
	if(document.getElementById("name").value == "")
		name = "Nerd with No Name";
	else
		name = document.getElementById("name").value;
	VR = document.getElementById("cardboard").className == "tools sel";
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='menuitem title button' id='host' ontouchstart='this.click()' onclick='host()'>Host a game</div><div class='menuitem title button' ontouchstart='this.click()' id='join' onclick='joinGame()'>Join a game</div>";
		f.style.transform = "none";
		setTimeout(function(){
			document.getElementById("host").style.transform = "none";
			setTimeout(function(){
				document.getElementById("host").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 500);
		setTimeout(function(){
			document.getElementById("join").style.transform = "none";
			setTimeout(function(){
				document.getElementById("join").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 1000);
	}, 500);
}

host = function(){
	document.getElementById("host").onclick = null;
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='info title'>Use this code to join the game!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()' ontouchstart='this.click()'>Start!</div>";
		if(VR)
			f.innerHTML += "<div id='divider'></div>";
		f.appendChild(element);
		f.style.transform = "none";
		getCode();
	}, 1000);

	function getCode(){
		code = "";
		var letters = "ABCDEFGHIJKLMMNOPQRSTUVWXYZ";
		for(var i = 0; i < 4; i++)
			code += letters[Math.floor(Math.random() * letters.length)];
		database.ref(code).once("value", function(codeCheck){
			console.log(codeCheck.val());
			if(codeCheck.val() == null || codeCheck.val().status == -1 || !codeCheck.val().timestamp || Date.now() - codeCheck.val().timestamp > 1000 * 60 * 60 * 24){ // Allow overwriting a game if it was created more than 24 hours ago - seems safe.
				console.log(code);
				document.getElementById("code").innerHTML = code;

				database.ref(code).set({
					status: 0,
					players: {},
					map: document.getElementById("trackcode").innerHTML,
					timestamp: Date.now(),
					settings: { laps: LAPS, speed: SPEED }
				});

				// ===== LIVE SETTINGS PANEL (host only) =====
				var lsPanel = document.createElement("DIV");
				lsPanel.id = "livesettings";
				lsPanel.style.display = "block";
				lsPanel.innerHTML = "<div id='livesettings-title'>Game Settings</div>" +
					"<div class='ls-row'><span class='ls-label'>LAPS</span><div class='ls-controls'><button class='ls-btn' onclick='lsChange(\"laps\",-1)'>-</button><span class='ls-val' id='ls-laps'>" + LAPS + "</span><button class='ls-btn' onclick='lsChange(\"laps\",1)'>+</button></div></div>" +
					"<div class='ls-row'><span class='ls-label'>SPEED</span><div class='ls-controls'><button class='ls-btn' onclick='lsChange(\"speed\",-1)'>-</button><span class='ls-val' id='ls-speed'>x1</span><button class='ls-btn' onclick='lsChange(\"speed\",1)'>+</button></div></div>";
				f.appendChild(lsPanel);

				window.lsSpeedMult = 1;
				window.lsChange = function(setting, delta){
					if(setting === "laps"){
						LAPS = Math.max(1, Math.min(10, LAPS + delta));
						document.getElementById("ls-laps").textContent = LAPS;
					} else if(setting === "speed"){
						window.lsSpeedMult = Math.max(0.5, Math.min(3, parseFloat((window.lsSpeedMult + delta * 0.25).toFixed(2))));
						SPEED = parseFloat((0.0084 * window.lsSpeedMult).toFixed(6));
						document.getElementById("ls-speed").textContent = "x" + window.lsSpeedMult.toFixed(2);
					}
					database.ref(code + "/settings").set({ laps: LAPS, speed: SPEED });
				};

				database.ref(code + "/players").on("child_added", function(p){
					console.log(p);
					players[p.ref_.path.pieces_[2]] = {
						data: p.val(),
						model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
					};
					// Track for startGame player count
					if(!window._lobbyPlayers) window._lobbyPlayers = {};
					window._lobbyPlayers[p.ref_.path.pieces_[2]] = true;
					var pl = players[p.ref_.path.pieces_[2]];
					pl.model.position.set(pl.data.x, 0.6, pl.data.y);
					pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
					var wheel = new THREE.Mesh(
						new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
						new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
					);
					var w1 = wheel.clone();
					w1.position.set(0.6, -0.1, 0.7);
					w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w1);
					var w2 = wheel.clone();
					w2.position.set(-0.6, -0.1, 0.7);
					w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w2);
					var w3 = wheel.clone();
					w3.position.set(0.6, -0.1, -0.7);
					w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w3);
					var w4 = wheel.clone();
					w4.position.set(-0.6, -0.1, -0.7);
					w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w4);
					var label = document.createElement("DIV");
					label.className = "label";
					label.innerHTML = pl.data.name.replaceAll("<", "&lt;") + "<br/>|";
					pl.label = label;
					label.position = pl.model.position;
					console.log(label);
					f.appendChild(label);
					labels.push(label);
					pl.model.receiveShadow = true;
					scene.add(pl.model);

					if(p.ref_.path.pieces_[2] == me.ref.path.pieces_[2]){
						me.label = pl.label;
						me.model = pl.model;
						me.label.innerHTML = "";
					}
				});

				database.ref(code + "/players").on("child_changed", function(p){
					// console.log(p);
					players[p.ref_.path.pieces_[2]].data = p.val();
				});

				me.ref = database.ref(code + "/players").push();
				me.data = {
					x: 0,
					y: 0,
					xv: 0,
					yv: 0,
					dir: 0,
					steer: 0,
					color: color,
					name: name,
					checkpoint: 1,
					cpProgress: 0,
					lap: 0,
					collision: {},
					pcId: PC_ID,
					raceTime: 0,
					finished: false
				}
				me.ref.set(me.data);

				database.ref(code + "/status").on("value", function(v){
					v = v.val();
					if(v == 1){
						document.getElementsByClassName("info")[0].outerHTML = "";
						document.getElementById("startgame").outerHTML = "";
						// Remove live settings panel
						var lsp = document.getElementById("livesettings");
						if(lsp) lsp.outerHTML = "";

						gameStarted = true;
						gameSortaStarted = true;

						var countDown = document.createElement("DIV");
						countDown.innerHTML = "3";
						countDown.className = "title";
						countDown.id = "countdown";
						f.appendChild(countDown);

						lap = document.createElement("DIV");
						lap.innerHTML = "1/" + LAPS;
						lap.className = "title";
						lap.id = "lap";
						f.appendChild(lap);

						// Boost bar UI
						var boostContainer = document.createElement("DIV");
						boostContainer.id = "boostcontainer";
						boostContainer.style.cssText = "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:200px;background:rgba(0,0,0,0.5);border:2px solid white;border-radius:10px;overflow:hidden;height:16px;";
						var boostBar = document.createElement("DIV");
						boostBar.id = "boostbar";
						boostBar.style.cssText = "width:100%;height:100%;background:linear-gradient(90deg,#f4d03f,#e67e22);transition:width 0.05s;border-radius:8px;";
						boostContainer.appendChild(boostBar);
						f.appendChild(boostContainer);

						// ===== LEADERBOARD =====
						var lb = document.createElement("DIV");
						lb.id = "leaderboard";
						lb.innerHTML = "<div id='leaderboard-title'>RACE</div>" +
							"<div id='lb-lap-timer-row'>" +
								"<span id='lb-lap-timer'>00:00.000</span>" +
								"<span id='lb-position-badge'>P1</span>" +
							"</div>" +
							"<div id='lb-rows'></div>";
						lb.style.display = "block";
						f.appendChild(lb);

						window._raceStartTime = null;
						window._myFinishTime = null;
						window._lapStartTime = null;
						window._lastTrackedLap = 0;

						setTimeout(function(){ countDown.innerHTML = "2"; }, 1000);
						setTimeout(function(){ countDown.innerHTML = "1"; }, 2000);
						setTimeout(function(){
							countDown.innerHTML = "GO!";
							gameSortaStarted = false;
							window._raceStartTime = performance.now();
							window._lapStartTime = performance.now();
						}, 3000);
						setTimeout(function(){ countDown.innerHTML = ""; }, 4000);
					}  // end if(v == 1)
				}); // end status.on
			}else
				getCode();
		}); // end codeCheck.once
	}  // end getCode

	join();
}  // end host

joinGame = function(){
	document.getElementById("join").onclick = null;
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='info title'>Enter a code to join a game!<input id='incode' class='title' onkeyup='codeCheck(event)' ontouchstart='this.focus()'></input></div>";
		if(VR)
			f.innerHTML += "<div id='divider'></div>";
		f.appendChild(element);
		f.style.transform = "none";
	}, 1000);
	join();
}

var map, trees, signs, startc, checkpointsc, main;

function deleteMap(){
	while(map.children.length > 0)
		map.remove(map.children[0]);
	scene.remove(map);
	while(trees.children.length > 0)
		trees.remove(trees.children[0]);
	scene.remove(trees);
	while(signs.children.length > 0)
		signs.remove(signs.children[0]);
	scene.remove(signs);
	while(startc.children.length > 0)
		startc.remove(startc.children[0]);
	scene.remove(startc);
	if(checkpointsc){
		while(checkpointsc.children.length > 0)
			checkpointsc.remove(checkpointsc.children[0]);
		// not in scene, just clear the object
	}
	while(main.children.length > 0)
		main.remove(main.children[0]);
	scene.remove(main);
}

function loadMap(){
	var racedata = document.getElementById("trackcode").innerHTML.trim().split("|")[0].trim().split(" ");
	var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342)});
	//var mapscale = 7;
	map = new THREE.Object3D();
	for(var i = 0; i < racedata.length; i++){
		if(racedata[i] == "")
			continue;
		var point1 = new THREE.Vector2(parseInt(racedata[i].split("/")[0].split(",")[0]), parseInt(racedata[i].split("/")[0].split(",")[1]));
		var point2 = new THREE.Vector2(parseInt(racedata[i].split("/")[1].split(",")[0]), parseInt(racedata[i].split("/")[1].split(",")[1]));
		var wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale + 0.3, 1.5, 0.3),
			material
		);
		var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
		wall.rotation.set(0, angle, 0, "YXZ");
		var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		wall.plane = plane;
		wall.width = point1.distanceTo(point2) * mapscale;
		wall.p1 = point1.multiply(new THREE.Vector2(-mapscale, mapscale));
		wall.p2 = point2.multiply(new THREE.Vector2(-mapscale, mapscale));
		wall.castShadow = true;
		wall.receiveShadow = true;
		map.add(wall);
	}
	scene.add(map);

	trees = new THREE.Object3D();
	var tree = new THREE.Mesh(
		new THREE.CylinderBufferGeometry(0, 4, 15),
		new THREE.MeshLambertMaterial({color: new THREE.Color("#1bad2c")})
	);
	var treedata = document.getElementById("trackcode").innerHTML.trim().split("|")[2].trim().split(" ");
	for(var i = 0; i < treedata.length; i++){
		if(treedata[i] == "")
			continue;
		var t = tree.clone();
		t.position.set(-parseInt(treedata[i].split(",")[0]) * mapscale, 0, parseInt(treedata[i].split(",")[1]) * mapscale);
		var s = Math.random() + 1;
		t.scale.set(s, s, s);
		t.castShadow = true;
		t.receiveShadow = true;
		trees.add(t);
	}
	scene.add(trees);

	signs = new THREE.Object3D();
	var sign = new THREE.Mesh(
		new THREE.ConeBufferGeometry(0.7, 2, 5),
		new THREE.MeshLambertMaterial({color: new THREE.Color("#f00")})
	);
	var signdata = document.getElementById("trackcode").innerHTML.trim().split("|")[3].trim().split(" ");
	for(var i = 0; i < signdata.length; i++){
		if(signdata[i] == "")
			continue;
		var s = sign.clone();
		var da = signdata[i].split("/");
		s.position.set(-parseFloat(da[0].split(",")[0]) * mapscale, parseFloat(da[0].split(",")[1]) + 1, parseFloat(da[0].split(",")[2]) * mapscale);
		s.rotation.set(Math.PI / 2, parseInt(da[1]) / 180 * Math.PI, 0, "YXZ");
		s.castShadow = true;
		s.receiveShadow = true;
		signs.add(s);
	}
	scene.add(signs);

	var startdata = document.getElementById("trackcode").innerHTML.trim().split("|")[1].trim().split(" ");
	startc = new THREE.Object3D();
	for(var i = 0; i < startdata.length; i++){
		if(startdata[i] == "")
			continue;
		var point1 = new THREE.Vector2(parseInt(startdata[i].split("/")[0].split(",")[0]), parseInt(startdata[i].split("/")[0].split(",")[1]));
		var point2 = new THREE.Vector2(parseInt(startdata[i].split("/")[1].split(",")[0]), parseInt(startdata[i].split("/")[1].split(",")[1]));
		var wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 0.1, 1),
			new THREE.MeshLambertMaterial({color: new THREE.Color(i == 0 ? "#2580db" : "#db2525")})
		);
		var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0, (point1.y + point2.y) / 2 * mapscale);
		wall.rotation.set(0, angle, 0, "YXZ");
		var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		wall.plane = plane;
		wall.width = point1.distanceTo(point2) * mapscale;
		wall.castShadow = true;
		wall.receiveShadow = true;
		startc.add(wall);
	}
	scene.add(startc);

	main = new THREE.Object3D();

	var stripes = new THREE.TextureLoader().load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQYV2NgYGD4z/D/////AA/6BPwHejn9AAAAAElFTkSuQmCC");
	stripes.magFilter = THREE.NearestFilter;
	stripes.wrapS = THREE.RepeatWrapping;
	stripes.wrapT = THREE.RepeatWrapping;
	stripes.repeat.set(100, 100);
	var ground = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1000, 1000),
		new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115), emissive: new THREE.Color(0x0f0f0f), emissiveMap: stripes})
	);
	ground.rotation.set(-Math.PI / 2, 0, 0);
	ground.receiveShadow = true;
	main.add(ground);

	for(var i = 0; i < 100; i++){
		var cube = new THREE.Mesh(
			new THREE.BoxBufferGeometry(100, 100, 100),
			new THREE.MeshLambertMaterial({color: new THREE.Color("#888"), side: THREE.DoubleSide})
		);
		var dist = Math.random() * MOUNTAIN_DIST + MOUNTAIN_DIST;
		var dir = Math.random() * Math.PI * 2;
		cube.position.set(dist * Math.sin(dir), 0, dist * Math.cos(dir));
		cube.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
		main.add(cube);
	}
	scene.add(main);

	// ===== CHECKPOINTS (segment 4) =====
	checkpointsc = new THREE.Object3D();
	try {
		var cpRawData = document.getElementById("trackcode").innerHTML.trim().split("|");
		var cpdata = cpRawData.length > 4 ? cpRawData[4].trim().split(" ") : [];
		for(var i = 0; i < cpdata.length; i++){
			if(!cpdata[i] || cpdata[i].trim() == "" || cpdata[i].indexOf("/") < 0)
				continue;
			var cpParts = cpdata[i].split("/");
			if(cpParts.length < 2) continue;
			var p1parts = cpParts[0].split(",");
			var p2parts = cpParts[1].split(",");
			if(p1parts.length < 2 || p2parts.length < 2) continue;
			var x1 = parseInt(p1parts[0]), y1 = parseInt(p1parts[1]);
			var x2 = parseInt(p2parts[0]), y2 = parseInt(p2parts[1]);
			if(isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) continue;
			var point1 = new THREE.Vector2(x1, y1);
			var point2 = new THREE.Vector2(x2, y2);
			var cpWall = new THREE.Mesh(
				new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 0.15, 1),
				new THREE.MeshLambertMaterial()
			);
			cpWall.visible = false; // invisible trigger zone
			var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
			cpWall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0, (point1.y + point2.y) / 2 * mapscale);
			cpWall.rotation.set(0, angle, 0, "YXZ");
			var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
			cpWall.plane = plane;
			cpWall.width = point1.distanceTo(point2) * mapscale;
			cpWall.p1 = new THREE.Vector2(-x1 * mapscale, y1 * mapscale);
			cpWall.p2 = new THREE.Vector2(-x2 * mapscale, y2 * mapscale);
			cpWall.cpIndex = i;
			checkpointsc.add(cpWall);
		}
	} catch(e) {
		console.warn("Checkpoint parse error:", e);
	}
	// Don't add to scene — checkpoints are invisible trigger zones only

	// Eval code: segment 5 for new format (with checkpoints), segment 4 for old format
	var segments = document.getElementById("trackcode").innerText.trim().split("|");
	var evalCode = segments.length >= 6 ? segments[5] : segments[4];
	return evalCode || "";
}

function join(){
	try {
		eval(loadMap());
	} catch(e) {
		console.error("loadMap error:", e);
		alert("Map load error: " + e.message);
		return;
	}

	scene.background = new THREE.Color(0x7fb0ff);

	camera = new THREE.PerspectiveCamera(
		90,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);

	camera.position.set(0, 3, 10);
	scene.add(camera);

	var player = new THREE.Object3D();
	player.position.set(0, 0, 0);

	camera.lookAt(player.position);

	scene.add(player);

	var light = new THREE.DirectionalLight(0xffffff, 0.7);
	light.position.set(3000, 2000, -2000);
	light.castShadow = true;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	light.shadow.camera.near = 3000;
	light.shadow.camera.far = 5000;
	light.shadow.camera.top = 100;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.left = -100;
	light.shadow.camera.right = 120;
	light.shadow.bias = 0.00002;
	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));

	//scene.add(new THREE.AmbientLight(0x404040));

	var x = 0;
	var ray = new THREE.Raycaster();
	function toXYCoords(pos){
		pos = pos.clone();
		pos.y += 0.5;
		var vector = pos.project(camera);
		vector.x = (vector.x + 1) / 2 * window.innerWidth;
		vector.y = -(vector.y - 1) / 2 * window.innerHeight;
		return vector;
	}
	var windowsize = {x: window.innerWidth, y: window.innerHeight};

	var ray = new THREE.Raycaster();
	ray.near = 0;
	ray.far = 1;

	var ren = renderer;
	var controls;
	if(VR){
		var effect = new THREE.StereoEffect(renderer);
		effect.setSize(window.innerWidth, window.innerHeight);
		effect.setEyeSeparation(0.7);
		ren = effect;
		controls = new THREE.DeviceOrientationControls(camera);
	}

	var lastTime = performance.now();
	function render(timestamp) {
		requestAnimationFrame(render);
		var timepassed = timestamp - lastTime;
		lastTime = timestamp;
		var warp = timepassed / 16;

		if(gameStarted){
			if(!mobile){
				if(left)
					me.data.steer = Math.PI / 6;
				if(right)
					me.data.steer = -Math.PI / 6;
				if(!(left ^ right))
					me.data.steer = 0;
			}
			if(VR)
				me.data.steer = camera.rotation.z;
			me.data.steer = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, me.data.steer));

			players[me.ref.path.pieces_[2]].data = me.data;

			if(!gameSortaStarted){
				for(var p in players){
					var play = players[p];

					play.data.dir += play.data.steer / 10 * warp;

					// Boost tank logic (only for local player)
					if(play == players[me.ref.path.pieces_[2]]){
						if(boostHeld && boostTank > 0){
							boostTank -= (100 / BOOST_DRAIN_TIME) * timepassed;
							if(boostTank < 0) boostTank = 0;
						} else if(!boostHeld && boostTank < 100){
							boostTank += (100 / BOOST_RECHARGE_TIME) * timepassed;
							if(boostTank > 100) boostTank = 100;
						}
						// Update boost bar UI
						var bar = document.getElementById("boostbar");
						if(bar) bar.style.width = boostTank + "%";
					}

					var isMe = (play == players[me.ref.path.pieces_[2]]);
					var isBoosting = (isMe && boostHeld && boostTank > 0);
					var isClutching = (isMe && clutch);
					var currentSpeed = isBoosting ? SPEED + BOOST_STRENGTH : SPEED;

					// Clutch: disengage engine — no acceleration, slow coast-down
					if(!isClutching){
						play.data.xv += Math.sin(play.data.dir) * currentSpeed * warp;
						play.data.yv += Math.cos(play.data.dir) * currentSpeed * warp;
					}

					if(isMe && braking && !isBoosting){
						play.data.xv *= Math.pow(BRAKE_POWER, warp);
						play.data.yv *= Math.pow(BRAKE_POWER, warp);
						play.data.xv -= Math.sin(play.data.dir) * BRAKE_REVERSE * warp;
						play.data.yv -= Math.cos(play.data.dir) * BRAKE_REVERSE * warp;
					} else if(isClutching){
						// Clutch decel: slower than braking, faster than normal friction
						play.data.xv *= Math.pow(CLUTCH_FRICTION, warp);
						play.data.yv *= Math.pow(CLUTCH_FRICTION, warp);
					} else {
						play.data.xv *= Math.pow(0.99, warp);
						play.data.yv *= Math.pow(0.99, warp);
					}

					play.data.x += play.data.xv * warp;
					play.data.y += play.data.yv * warp;

					play.model.position.x = play.data.x + play.data.xv;
					play.model.position.z = play.data.y + play.data.yv;
					play.model.rotation.y = play.data.dir;

					play.model.children[0].rotation.z = Math.PI / 2 - play.data.steer;
					play.model.children[1].rotation.z = Math.PI / 2 - play.data.steer;

					// function checkCubes(angle){
					// 	ray.set(play.model.position, angle);
					// 	var inter = ray.intersectObjects(blocks);
					// 	if(inter.length > 0 && inter[0].distance < 0.5){
					// 		// console.log(inter[0]);
					// 		var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
					// 		vel.reflect(inter[0].face.normal);
					// 		play.data.xv = vel.x * 0.3;
					// 		play.data.yv = vel.z * 0.3;
					// 		play.data.x += play.data.xv;
					// 		play.data.y += play.data.yv;
					// 	}
					// }
					// checkCubes(new THREE.Vector3(0, 0, 1));
					// checkCubes(new THREE.Vector3(0, 0, -1));
					// checkCubes(new THREE.Vector3(1, 0, 0));
					// checkCubes(new THREE.Vector3(-1, 0, 0));

					for(var w in map.children){
						var wall = map.children[w];
						var posi = new THREE.Vector2(play.data.x, play.data.y);
						if(Math.abs(wall.plane.distanceToPoint(play.model.position.clone().sub(wall.position))) < WALL_SIZE){
							if(wall.position.clone().distanceTo(play.model.position) < wall.width / 2){
								var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
								vel.reflect(wall.plane.normal);
								play.data.xv = vel.x + BOUNCE_CORRECT * wall.plane.normal.x * Math.sign(wall.plane.normal.dot(play.model.position.clone().sub(wall.position)));
								play.data.yv = vel.z + BOUNCE_CORRECT * wall.plane.normal.z * Math.sign(wall.plane.normal.dot(play.model.position.clone().sub(wall.position)));
								//var dir = Math.normalize();
								while(Math.abs(wall.plane.distanceToPoint(new THREE.Vector3(play.data.x, 0, play.data.y).sub(wall.position))) < WALL_SIZE){
									play.data.x += play.data.xv;
									play.data.y += play.data.yv;
								}
								play.data.xv *= BOUNCE;
								play.data.yv *= BOUNCE;
							}
						}
						if(posi.distanceTo(wall.p1) < WALL_SIZE + 0.1){
							// console.log("o1");
							var norm = posi.clone().sub(wall.p1);
							norm = new THREE.Vector3(norm.x, 0, norm.y);
							norm.normalize();
							var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
							vel.reflect(norm);
							play.data.xv = vel.x + norm.x * BOUNCE_CORRECT * 1;
							play.data.yv = vel.z + norm.z * BOUNCE_CORRECT * 1;
							while((new THREE.Vector2(play.data.x, play.data.y)).distanceTo(wall.p1) < WALL_SIZE + 0.1){
								play.data.x += play.data.xv;
								play.data.y += play.data.yv;
							}
							play.data.xv *= BOUNCE;
							play.data.yv *= BOUNCE;
						}
						if(posi.distanceTo(wall.p2) < WALL_SIZE + 0.1){
							// console.log("o2");
							var norm = posi.clone().sub(wall.p2);
							norm = new THREE.Vector3(norm.x, 0, norm.y);
							norm.normalize();
							var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
							vel.reflect(norm);
							play.data.xv = vel.x + norm.x * BOUNCE_CORRECT * 1;
							play.data.yv = vel.z + norm.z * BOUNCE_CORRECT * 1;
							while((new THREE.Vector2(play.data.x, play.data.y)).distanceTo(wall.p2) < WALL_SIZE + 0.1){
								play.data.x += play.data.xv;
								play.data.y += play.data.yv;
							}
							play.data.xv *= BOUNCE;
							play.data.yv *= BOUNCE;
						}
					}

					// ===== CHECKPOINT & LAP DETECTION (local player only) =====
					if(play == players[me.ref.path.pieces_[2]]){
						var totalCPs = checkpointsc ? checkpointsc.children.length : 0;

						// Sequential checkpoint system — only the NEXT expected checkpoint triggers
						// window._cpNext = index of next checkpoint to hit (0-based)
						if(typeof window._cpNext === "undefined") window._cpNext = 0;

						if(checkpointsc && totalCPs > 0 && window._cpNext < totalCPs){
							var cpLine = checkpointsc.children[window._cpNext];
							if(Math.abs(cpLine.plane.distanceToPoint(play.model.position.clone().sub(cpLine.position))) < 1){
								if(cpLine.position.clone().distanceTo(play.model.position) < cpLine.width / 2 + 1){
									window._cpNext++;
									play.data.cpProgress = window._cpNext;
								}
							}
						}

						// Start/finish line
						for(var i in startc.children){
							var cp = startc.children[i];
							if(Math.abs(cp.plane.distanceToPoint(play.model.position.clone().sub(cp.position))) < 1){
								if(cp.position.clone().distanceTo(play.model.position) < cp.width / 2 + 1){
									if(i == 0){
										if(totalCPs === 0 || window._cpNext >= totalCPs){
											if(play.data.checkpoint == 1){
												play.data.checkpoint = 0;
												window._cpNext = 0;
												play.data.cpProgress = 0;
												play.data.lap++;
											}
										}
									} else {
										play.data.checkpoint = 1;
									}
								}
							}
						}
					}

					if(play.data.lap > LAPS && document.getElementById("countdown").innerHTML == ""){
						document.getElementById("countdown").style.fontSize = "25vmin";
						document.getElementById("countdown").innerHTML = play.data.name.replaceAll("<", "&lt;") + " Won!";

						// ===== RECORD FINISH =====
						if(play == players[me.ref.path.pieces_[2]] && !window._myFinishTime){
							window._myFinishTime = window._raceStartTime ? (performance.now() - window._raceStartTime) : 0;
							play.data.raceTime = window._myFinishTime;
							play.data.finished = true;

							// Work out finishing position from other players already done
							if(!window._finishPositions) window._finishPositions = [];
							window._finishPositions.push(me.ref.path.pieces_[2]);
							var myPlace = window._finishPositions.length;

							// Fastest lap from recorded lap splits
							var lapSplits = window._myLapSplits || [];
							var fastestLap = lapSplits.length ? Math.min.apply(null, lapSplits) : window._myFinishTime;

							// Date key: "YYYY-MM-DD HH:00" (nearest hour)
							var now = new Date();
							var dateKey = now.getFullYear() + "-" +
								String(now.getMonth()+1).padStart(2,"0") + "-" +
								String(now.getDate()).padStart(2,"0") + " " +
								String(now.getHours()).padStart(2,"0") + ":00";

							// Map name from <title> tag or fallback
							var mapName = (document.querySelector("#trackcode [data-name]") || {}).dataset &&
								document.querySelector("#trackcode [data-name]").dataset.name ||
								document.title || "Custom Track";

							var resultData = {
								name: me.data.name,
								pcId: PC_ID,
								color: me.data.color,
								place: myPlace,
								totalTime: window._myFinishTime,
								fastestLap: fastestLap,
								lapSplits: lapSplits,
								laps: LAPS,
								speed: parseFloat(SPEED.toFixed(6)),
								map: mapName,
								gameCode: code,
								timestamp: Date.now(),
								dateKey: dateKey
							};

							// /games/<dateKey>/<gameCode>/results/<playerKey>
							database.ref("games/" + dateKey + "/" + code + "/results/" + me.ref.path.pieces_[2]).set(resultData);
							// /games/<dateKey>/<gameCode>/meta — written once by first finisher
							database.ref("games/" + dateKey + "/" + code + "/meta").once("value", function(ms){
								if(!ms.val()){
									database.ref("games/" + dateKey + "/" + code + "/meta").set({
										map: mapName,
										laps: LAPS,
										speed: parseFloat(SPEED.toFixed(6)),
										gameCode: code,
										dateKey: dateKey,
										startedAt: window._raceStartTime ? (Date.now() - window._myFinishTime) : Date.now(),
										players: Object.keys(players).length
									});
								}
							});
							// Per-PC history
							database.ref("history/" + PC_ID).push(resultData);
						} else if(!window._finishPositions){
							window._finishPositions = [];
						}

						// Track other players finishing (for position counting)
						var pk2 = Object.keys(players).find(function(k){ return players[k] == play; });
						if(pk2 && window._finishPositions && window._finishPositions.indexOf(pk2) === -1){
							window._finishPositions.push(pk2);
						}
					}

					// Track race time for my player
					if(play == players[me.ref.path.pieces_[2]] && window._raceStartTime && !window._myFinishTime){
						play.data.raceTime = performance.now() - window._raceStartTime;

						// Lap timer - reset when lap increases, record split
						if(typeof window._lastTrackedLap === "undefined") window._lastTrackedLap = 0;
						if(!window._myLapSplits) window._myLapSplits = [];
						if(!window._finishPositions) window._finishPositions = [];
						if(play.data.lap > window._lastTrackedLap && window._lapStartTime){
							var splitTime = performance.now() - window._lapStartTime;
							window._myLapSplits.push(Math.round(splitTime));
							window._lastTrackedLap = play.data.lap;
							window._lapStartTime = performance.now();
						}
					}

					for(var pl in players){
						if(play != players[pl] && play.model.position.distanceTo(players[pl].model.position) < 2){
							var ply = players[pl];
							var temp = new THREE.Vector2(play.data.xv, play.data.yv);
							var temp2 = new THREE.Vector2(ply.data.xv, ply.data.yv);
							ply.data.xv -= temp.x;
							ply.data.yv -= temp.y;
							play.data.xv -= temp2.x;
							play.data.yv -= temp2.y;
							var norm = (new THREE.Vector2(play.data.x, play.data.y)).sub(new THREE.Vector2(ply.data.x, ply.data.y));
							norm = new THREE.Vector3(norm.x, 0, norm.y);
							norm.normalize();
							var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
							var vel2 = new THREE.Vector3(ply.data.xv, 0, ply.data.yv);
							vel.reflect(norm);
							vel2.reflect(norm);
							ply.data.xv += COLLISION * vel2.x;
							ply.data.yv += COLLISION * vel2.z;
							play.data.xv += COLLISION * vel.x;
							play.data.yv += COLLISION * vel.z;
							ply.data.xv += temp.x;
							ply.data.yv += temp.y;
							play.data.xv += temp2.x;
							play.data.yv += temp2.y;
							while((new THREE.Vector2(play.data.x, play.data.y)).distanceTo(new THREE.Vector2(ply.data.x, ply.data.y)) < 2){
								play.data.x += play.data.xv;
								play.data.y += play.data.yv;
							}
						}
					}

					if(play.model.position.distanceTo(new THREE.Vector3()) > OOB_DIST){
						play.data.x = 0;
						play.data.y = 0;
					}
				}
			}

			var target = new THREE.Vector3(
				me.model.position.x + Math.sin(-me.model.rotation.y) * 5,
				3,
				me.model.position.z + -Math.cos(-me.model.rotation.y) * 5
			);
			camera.position.set(
				camera.position.x * Math.pow(CAMERA_LAG, warp) + target.x * (1 - Math.pow(CAMERA_LAG, warp)),
				3,
				camera.position.z * Math.pow(CAMERA_LAG, warp) + target.z * (1 - Math.pow(CAMERA_LAG, warp))
			);
			camera.lookAt(me.model.position);

			me.ref.set(me.data);

			lap.innerHTML = me.data.lap <= LAPS ? (me.data.lap + 1) + "/" + LAPS : "";

			// ===== UPDATE LEADERBOARD =====
			var lbRows = document.getElementById("lb-rows");
			if(lbRows){
				var myKey = me.ref.path.pieces_[2];
				var myData = me.data;

				// ---- Lap timer: reset on each new lap ----
				var myLap = Math.min(myData.lap || 1, LAPS);
				if(window._lapStartTime && window._lastTrackedLap !== myLap){
					window._lapStartTime = performance.now();
					window._lastTrackedLap = myLap;
				}
				var lapElapsed = (window._lapStartTime && !window._myFinishTime)
					? performance.now() - window._lapStartTime
					: (window._myFinishTime ? 0 : 0);
				var ltEl = document.getElementById("lb-lap-timer");
				if(ltEl && !window._myFinishTime){
					var lm = Math.floor(lapElapsed / 60000);
					var ls = Math.floor((lapElapsed % 60000) / 1000);
					var lms = Math.floor(lapElapsed % 1000);
					ltEl.textContent =
						String(lm).padStart(2,"0") + ":" +
						String(ls).padStart(2,"0") + "." +
						String(lms).padStart(3,"0");
				} else if(ltEl && window._myFinishTime){
					ltEl.textContent = "DONE";
				}

				// ---- Build sorted data ----
				var lbData = [];
				var totalCPsLB = checkpointsc ? checkpointsc.children.length : 0;
				for(var pk in players){
					var pd = players[pk].data;
					var elapsed = 0;
					if(window._raceStartTime){
						if(pd.finished && pd.raceTime){
							elapsed = pd.raceTime;
						} else if(pk === myKey && !window._myFinishTime){
							elapsed = performance.now() - window._raceStartTime;
						} else {
							elapsed = pd.raceTime || 0;
						}
					}
					// Progress: lap * (totalCPs+1) + checkpoints hit this lap
					var cpHit = pd.cpProgress || 0;
					var progress = (pd.lap || 0) * (totalCPsLB + 1) + cpHit;
					lbData.push({
						key: pk,
						name: pd.name || "?",
						color: pd.color || 0,
						lap: pd.lap || 0,
						cpHit: cpHit,
						progress: progress,
						finished: pd.finished || (pd.lap > LAPS),
						raceTime: elapsed
					});
				}
				lbData.sort(function(a, b){
					if(a.finished && b.finished) return a.raceTime - b.raceTime;
					if(a.finished) return -1;
					if(b.finished) return 1;
					// Sort by progress (lap * (totalCPs+1) + checkpoints hit this lap)
					return b.progress - a.progress;
				});

				// ---- Position badge ----
				var myPos = 1;
				for(var pi = 0; pi < lbData.length; pi++){
					if(lbData[pi].key === myKey){ myPos = pi + 1; break; }
				}
				var badge = document.getElementById("lb-position-badge");
				if(badge){
					var suffixes = ["","st","nd","rd"];
					var suf = myPos <= 3 ? suffixes[myPos] : "th";
					badge.textContent = myPos + suf;
					badge.className = ""; // reset
					if(myPos === 1) badge.className = "pos-1st";
					else if(myPos === 2) badge.className = "pos-2nd";
					else if(myPos === 3) badge.className = "pos-3rd";
				}

				// ---- Rows ----
				function fmtTime(ms){
					var m = Math.floor(ms / 60000);
					var s = Math.floor((ms % 60000) / 1000);
					var msec = Math.floor(ms % 1000);
					return String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0") + "." + String(msec).padStart(3,"0");
				}
				var html = "";
				for(var i = 0; i < lbData.length; i++){
					var d = lbData[i];
					var isMe = d.key === myKey;
					var lapCol = "L" + Math.min(d.lap + 1, LAPS) + "/" + LAPS;
					if(totalCPsLB > 0 && !d.finished)
						lapCol += " CP" + d.cpHit + "/" + totalCPsLB;
					var timeStr = "";
					if(d.finished){
						timeStr = "<span class='lb-finished'>" + fmtTime(d.raceTime) + "</span>";
						lapCol = "✓";
					} else {
						timeStr = fmtTime(d.raceTime);
					}
					var colorHex = "hsl(" + d.color + ",100%,50%)";
					html += "<div class='lb-row" + (isMe ? " lb-me" : "") + "'>" +
						"<span class='lb-pos'>" + (i+1) + "</span>" +
						"<span class='lb-color' style='background:" + colorHex + "'></span>" +
						"<span class='lb-name'>" + d.name.replaceAll("<","&lt;").substring(0,10) + "</span>" +
						"<span class='lb-lap-col'>" + lapCol + "</span>" +
						"<span class='lb-info'>" + timeStr + "</span>" +
						"</div>";
				}
				lbRows.innerHTML = html;
			}
		}else{
			camera.position.set(50 * Math.sin(x), 20, 50 * Math.cos(x));
			camera.lookAt(player.position);
		}

		x += 0.01;

		camera.updateMatrix();
		camera.updateMatrixWorld();
		camera.updateProjectionMatrix();
		var frustum = new THREE.Frustum();
		frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		for(var i = 0; i < labels.length; i++){
			var label = labels[i];
			if(frustum.containsPoint(label.position) && !VR){
				var vec = toXYCoords(label.position);
				label.style.left = vec.x + "px";
				label.style.top = vec.y + "px";
				label.style.zIndex = 99999 - Math.floor(camera.position.distanceTo(label.position) * 10);
				label.style.display = "inline-block";
			}else
				label.style.display = "none";
		}

		if(windowsize.x != window.innerWidth || windowsize.x != window.innerHeight){
			windowsize = {x: window.innerWidth, y: window.innerHeight};
			onWindowResize();
		}

		if(VR){
			var a = camera.rotation.y;
			controls.update();
			camera.rotation.y += a - Math.PI / 2;
		}
		ren.render(scene, camera);
		MODS();
	}

	render(performance.now());

	window.addEventListener("resize", onWindowResize, false);
	window.addEventListener("orientationchange", onWindowResize, false);

	function onWindowResize(){
		function orientCamera(){
			camera.aspect = window.innerWidth / window.innerHeight;
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		orientCamera();
		setTimeout(orientCamera, 0);
	}
}
codeCheck = function(){
	var incode = document.getElementById("incode");
	if(incode.value.length == 4){
		incode.onkeyup = null;
		code = incode.value.toUpperCase();
		database.ref(code).once("value", function(cc){
			if(typeof cc.val() != "undefined" && cc.val() != null && cc.val().status === 0){
				document.getElementsByClassName("info")[0].innerHTML = "<div class='info title'>Waiting for the game to start...<div id='code'>" + code + "</div></div>";
				var playerCount = 0;
				for(var p in cc.val().players){
					playerCount++;
					console.log(p);
					players[p] = {
						data: cc.val().players[p],
						model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
					};
					var pl = players[p];
					pl.model.position.set(pl.data.x, 0.6, pl.data.y);
					pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
					var wheel = new THREE.Mesh(
						new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
						new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
					);
					var w1 = wheel.clone();
					w1.position.set(0.6, -0.1, 0.7);
					w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w1);
					var w2 = wheel.clone();
					w2.position.set(-0.6, -0.1, 0.7);
					w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w2);
					var w3 = wheel.clone();
					w3.position.set(0.6, -0.1, -0.7);
					w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w3);
					var w4 = wheel.clone();
					w4.position.set(-0.6, -0.1, -0.7);
					w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w4);
					var label = document.createElement("DIV");
					label.className = "label";
					label.innerHTML = pl.data.name.replaceAll("<", "&lt;").substring(0, 50) + "<br/>|";
					pl.label = label;
					label.position = pl.model.position;
					console.log(label);
					f.appendChild(label);
					labels.push(label);
					pl.model.receiveShadow = true;
					scene.add(pl.model);
				}
				database.ref(code + "/players").on("child_added", function(p){
					if(typeof players[p.ref_.path.pieces_[2]] == "undefined"){
						console.log(p);
						players[p.ref_.path.pieces_[2]] = {
							data: p.val(),
							model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
						};
						var pl = players[p.ref_.path.pieces_[2]];
						pl.model.position.set(pl.data.x, 0.6, pl.data.y);
						pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
						var wheel = new THREE.Mesh(
							new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
							new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
						);
						var w1 = wheel.clone();
						w1.position.set(0.6, -0.1, 0.7);
						w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w1);
						var w2 = wheel.clone();
						w2.position.set(-0.6, -0.1, 0.7);
						w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w2);
						var w3 = wheel.clone();
						w3.position.set(0.6, -0.1, -0.7);
						w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w3);
						var w4 = wheel.clone();
						w4.position.set(-0.6, -0.1, -0.7);
						w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w4);
						var label = document.createElement("DIV");
						label.className = "label";
						label.innerHTML = pl.data.name.replaceAll("<", "&lt;").substring(0, 50) + "<br/>|";
						pl.label = label;
						label.position = pl.model.position;
						console.log(label);
						f.appendChild(label);
						labels.push(label);
						pl.model.receiveShadow = true;
						scene.add(pl.model);

						if(p.ref_.path.pieces_[2] == me.ref.path.pieces_[2]){
							me.label = pl.label;
							me.model = pl.model;
							me.label.innerHTML = "";
						}
					}
				});

				database.ref(code + "/players").on("child_changed", function(p){
					// console.log(p);
					players[p.ref_.path.pieces_[2]].data = p.val();
				});
				console.log("playerCount: " + playerCount);
				me.ref = database.ref(code + "/players").push();
				me.data = {
					x: carPos[playerCount].x,
					y: carPos[playerCount].y,
					xv: 0,
					yv: 0,
					dir: 0,
					steer: 0,
					color: color,
					name: name,
					checkpoint: 1,
					cpProgress: 0,
					lap: 0,
					collision: {},
					pcId: PC_ID,
					raceTime: 0,
					finished: false
				}
				me.ref.set(me.data);

				database.ref(code + "/status").on("value", function(v){
					v = v.val();
					if(v == 1){
						document.getElementsByClassName("info")[0].outerHTML = "";

						gameStarted = true;
						gameSortaStarted = true;

						var countDown = document.createElement("DIV");
						countDown.innerHTML = "3";
						countDown.className = "title";
						countDown.id = "countdown";
						f.appendChild(countDown);

						lap = document.createElement("DIV");
						lap.innerHTML = "1/3";
						lap.className = "title";
						lap.id = "lap";
						f.appendChild(lap);

						// Boost bar UI
						var boostContainer = document.createElement("DIV");
						boostContainer.id = "boostcontainer";
						boostContainer.style.cssText = "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:200px;background:rgba(0,0,0,0.5);border:2px solid white;border-radius:10px;overflow:hidden;height:16px;";
						var boostBar = document.createElement("DIV");
						boostBar.id = "boostbar";
						boostBar.style.cssText = "width:100%;height:100%;background:linear-gradient(90deg,#f4d03f,#e67e22);transition:width 0.05s;border-radius:8px;";
						boostContainer.appendChild(boostBar);
						f.appendChild(boostContainer);

						// ===== LEADERBOARD =====
						var lb = document.createElement("DIV");
						lb.id = "leaderboard";
						lb.innerHTML = "<div id='leaderboard-title'>RACE</div>" +
							"<div id='lb-lap-timer-row'>" +
								"<span id='lb-lap-timer'>00:00.000</span>" +
								"<span id='lb-position-badge'>P1</span>" +
							"</div>" +
							"<div id='lb-rows'></div>";
						lb.style.display = "block";
						f.appendChild(lb);

						// ===== LAP TIMER =====
						window._raceStartTime = null;
						window._myFinishTime = null;
						window._lapStartTime = null;
						window._lastTrackedLap = 0;

						setTimeout(function(){ countDown.innerHTML = "2"; }, 1000);
						setTimeout(function(){ countDown.innerHTML = "1"; }, 2000);
						setTimeout(function(){
							countDown.innerHTML = "GO!";
							gameSortaStarted = false;
							window._raceStartTime = performance.now();
							window._lapStartTime = performance.now();
						}, 3000);
						setTimeout(function(){ countDown.innerHTML = ""; }, 4000);
					}
				});
				// Sync settings from host
				database.ref(code + "/settings").on("value", function(sv){
					var s = sv.val();
					if(s){
						if(typeof s.laps === "number") LAPS = s.laps;
						if(typeof s.speed === "number") SPEED = s.speed;
					}
				});
				database.ref(code + "/map").once("value", function(e){
					document.getElementById("trackcode").innerHTML = e.val();
					deleteMap();
					eval(loadMap());
				});
			}else
				incode.onkeyup = codeCheck;
		});
	}else{
		incode.onkeyup = codeCheck;
		if(incode.value.length > 4)
			incode.value = incode.value.substring(0, 4);
	}
}

function startGame(){
	database.ref(code + "/status").set(1);

	// Write initial game session record under /games/<dateKey>/<code>/meta
	var now = new Date();
	var dateKey = now.getFullYear() + "-" +
		String(now.getMonth()+1).padStart(2,"0") + "-" +
		String(now.getDate()).padStart(2,"0") + " " +
		String(now.getHours()).padStart(2,"0") + ":00";
	var mapName = document.title || "Custom Track";
	database.ref("games/" + dateKey + "/" + code + "/meta").set({
		map: mapName,
		laps: LAPS,
		speed: parseFloat(SPEED.toFixed(6)),
		gameCode: code,
		dateKey: dateKey,
		startedAt: Date.now(),
		hostPcId: PC_ID,
		players: Object.keys(window._lobbyPlayers || {}).length || 1
	});
}

window.onkeydown = function(e){
	if(e.keyCode == 37 || e.keyCode == 65) left = true;   // Left arrow or A
	if(e.keyCode == 39 || e.keyCode == 68) right = true;  // Right arrow or D
	if(e.keyCode == 16) boostHeld = true;
	if(e.keyCode == 32){ braking = true; e.preventDefault(); }
	// Clutch: Alt keys (18 = Alt, 225 = AltGr) or number keys 1-4
	if(e.keyCode == 18 || e.keyCode == 225 ||
	   e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51 || e.keyCode == 52){
		clutch = true;
		e.preventDefault();
	}
}

window.onkeyup = function(e){
	if(e.keyCode == 37 || e.keyCode == 65) left = false;   // Left arrow or A
	if(e.keyCode == 39 || e.keyCode == 68) right = false;  // Right arrow or D
	if(e.keyCode == 16) boostHeld = false;
	if(e.keyCode == 32) braking = false;
	// Release clutch when all clutch keys are up
	if(e.keyCode == 18 || e.keyCode == 225 ||
	   e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51 || e.keyCode == 52){
		clutch = false;
	}
}

if(mobile){

}

document.body.onkeydown = function(e){
	if(e.keyCode == 73 && (e.ctrlKey || e.metaKey))
		document.getElementById("trackcode").innerText = prompt("Track data?")
}
