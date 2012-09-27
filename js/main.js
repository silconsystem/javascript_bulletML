var objs = new Array();
var numObjElem = null;
var player = null;

var timer = null;

var canvasElem = null;
var ctx = null;

var keyState = [];

var bullets = {'ALL': []};
var bulletByName = {};

var logoImage = null;

var rankElem = null;
var blurElem = null;

function Obj() {
	this.alive = true;
}

Obj.prototype.move = function() {
};

Obj.prototype.draw = function() {
	//log(this.image.width);
	var tx = this.x - (this.image.width >> 1);
	var ty = this.y - (this.image.width >> 1);
	ctx.drawImage(this.image, tx, ty);
};

Obj.prototype.ensureBounded = function() {
	if (this.x < 4) this.x = 4;
	else if (this.x > W - 4) this.x = W - 4;
	if (this.y < 4) this.y = 4;
	else if (this.y > H - 4) this.y = H - 4;
};

Obj.prototype.checkBounded = function() {
	if (this.x < -4 || this.x > W+4 || this.y < -4 || this.y > H+4) {
		this.alive = false;
	}
};

function Shot(x, y, d, v) {
	Obj();
	this.x = x;
	this.y = y;
	this.d = d;
	this.v = v;
	this.image = IMAGES['w'];
}

Shot.prototype = new Obj();

Shot.prototype.move = function() {
	var r = Math.PI * this.d / 180;
	this.x += Math.sin(r) * this.v;
	this.y += -Math.cos(r) * this.v;
	this.checkBounded();
};

function Player() {
	Obj();
	this.x = W / 2;
	this.y = 350;
	this.image = IMAGES['r'];
}

Player.prototype = new Obj();

Player.prototype.move = function() {
	var v = keyState[90] ? 1 : 2;
	var d = -1;
	/* UP */
	if (keyState[38]) {
		/* RIGHT */
		if (keyState[39]) {
			d = 45;
		}
		/* LEFT */
		else if (keyState[37]) {
			d = -45;
		}
		else {
			d = 0;
		}
	}
	/* DOWN */
	else if (keyState[40]) {
		/* RIGHT */
		if (keyState[39]) {
			d = 135;
		}
		/* LEFT */
		else if (keyState[37]) {
			d = -135;
		}
		else {
			d = 180;
		}
	}
	/* RIGHT */
	else if (keyState[39]) {
		d = 90;
	}
	/* LEFT */
	else if (keyState[37]) {
		d = -90;
	}
	
	if (d != -1) {
		var r = Math.PI * d / 180;
		this.x = this.x + Math.sin(r) * v;
		this.y = this.y + -Math.cos(r) * v;
		this.ensureBounded();
	}
};

function Enemy(runner, x, y, image, d, v) {
	Obj();
	// TODO: messy
	runner.obj = this;
	this.runner = runner;
	this.x = x;
	this.y = y;
	this.d = d;
	this.v = v;
	this.image = IMAGES[image];
	this.isBoss = image == 'g';
}

Enemy.prototype = new Obj();

Enemy.prototype.move = function() {
	if (this.alive) {
		this.runner.run();
		
		var r = Math.PI * this.d / 180;
		this.x += Math.sin(r) * this.v;
		this.y += -Math.cos(r) * this.v;
		
		if (this.isBoss) {
			this.ensureBounded();
		}
		else {
			this.checkBounded();
		}
	}
};

Enemy.prototype.doVanish = function() {
	this.alive = false;
}

Enemy.prototype.getRank = function() {
	var rank = rankElem.value;
	if (rank > 100) rank = 100;
	else if (rank < 0) rank = 0;
	return rank / 100;
};

Enemy.prototype.getTurn = function() {
	return timer.tick;
};

Enemy.prototype.getDefaultSpeed = function() {
	return 1;
};

Enemy.prototype.getAimDirection = function() {
	var dx = player.x - this.x;
	var dy = player.y - this.y;
	return Math.atan2(dx, -dy) * 180 / Math.PI;
};

Enemy.prototype.getBulletDirection = function() {
	return this.d;
};

Enemy.prototype.getBulletSpeed = function() {
	return this.v;
};

Enemy.prototype.getBulletSpeedX = function() {
	var r = Math.PI * this.d / 180;
	return Math.sin(r) * this.v;
};

Enemy.prototype.getBulletSpeedY = function() {
	var r = Math.PI * this.d / 180;
	return -Math.cos(r) * this.v;
};

Enemy.prototype.createSimpleBullet = function(d, v) {
	var shot = new Shot(this.x, this.y, d, v);
	objs.push(shot);
};

Enemy.prototype.createBullet = function(state, d, v) {
	var runner = new BulletMLRunner(state.bulletml, state);
	var hasFire = (state.nodes[0].getElementsByTagName('fire') ||
	state.nodes[0].getElementsByTagName('fireRef'));
	var color = hasFire ? 'wg' : 'wr';
	var shot = new Enemy(runner, this.x, this.y, color, d, v);
	objs.push(shot);
};

Enemy.prototype.doChangeDirection = function(d) {
	this.d = d;
};

Enemy.prototype.doChangeSpeed = function(v) {
	this.v = v;
};

Enemy.prototype.doAccelX = function(vx) {
	var vy = this.getBulletSpeedY();
	log(vx + ',' + vy);
	this.v = Math.sqrt(vx * vx + vy * vy);
	this.d = Math.atan2(vx, -vy) * 180 / Math.PI;
};

Enemy.prototype.doAccelY = function(vy) {
	var vx = this.getBulletSpeedX();
	log(vx + ',' + vy);
	this.v = Math.sqrt(vx * vx + vy * vy);
	this.d = Math.atan2(vx, -vy) * 180 / Math.PI;
};

function move() {
	//var l = objs.length;
	for (var i = 0; i < objs.length; i++) {
		var o = objs[i];
		if (o.alive) {
			o.move();
		}
	}
	
	// Compaction.
	if (timer.fps_index == 0) {
		var nobjs = new Array();
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			if (o.alive) {
				nobjs.push(o);
			}
		}
		objs = nobjs;
		numObjElem.value = objs.length;
	}
}

function draw() {
	/*
	 *    ctx.fillStyle = 'rgba(0,0,0,0.3)';
	 *    ctx.globalCompositeOperation = 'source-over';
	 */
	var blur = blurElem.value;
	if (blur == 100) {
		ctx.fillStyle = 'rgb(0,0,0)';
		ctx.fillRect(0, 0, W, H);
	}
	else {
		ctx.fillStyle = 'rgba(0,0,0,' + (blur / 100) + ')';
		ctx.fillRect(0, 0, W, H);
	}
	
	for (var i = 0; i < objs.length; i++) {
		var o = objs[i];
		if (o.alive) {
			o.draw();
		}
	}
}

function proc() {
	move();
	if (!timer.shouldSkip) {
		draw();
	}
	timer.wait();
}

function getTagOptions(tag) {
	var options = '<option>---';
	for (var i = 0; i < bullets[tag].length; i++) {
		var name = bullets[tag][i].name;
		var title = bullets[tag][i].title;
		options += '<option value="' + name + '">' + title;
	}
	return options;
}

function createMenu() {
	var bulletList = downloadJson('bullets.json');
	var tagList = ['ALL'];
	for (var i = 0; i < bulletList.length; i++) {
		var b = bulletList[i];
		bullets.ALL.push(b);
		if (!bullets[b.tag]) {
			bullets[b.tag] = [];
			tagList.push(b.tag);
		}
		bullets[b.tag].push(b);
		bulletByName[b.name] = b;
	}
	
	var menu = '<select id="tag">';
	for (var i = 0; i < tagList.length; i++) {
		var tag = tagList[i];
		menu += '<option value="' + tag + '">' + tag;
	}
	menu += '</select><br>';
	
	menu += '<select id="bullets">';
	menu += getTagOptions('ALL');
	menu += '</select>';
	
	document.getElementById('info').innerHTML = menu;
	
	document.getElementById('tag').onchange = function(ev) {
		var tag = this[this.selectedIndex].value;
		log(tag);
		document.getElementById('bullets').innerHTML = getTagOptions(tag);
	};
	
	document.getElementById('bullets').onchange = function(ev) {
		var name = this[this.selectedIndex].value;
		log(name);
		var b = bulletByName[name];
		if (b.src == 'jsdmkun') {
			setTimeout("initGame('bullets/" + b.name + "');", 1);
		}
		else if (b.src == 'zipup') {
			setTimeout("initGame('bullets/" + b.name + "');", 1);
		}
		else {
			throw Error('Unknown bullet src: ' + b.src);
		}
		//document.getElementById('bullets').innerHTML = getTagOptions(tag);
	};
};

function initGame(xmlfile) {
	var bml = downloadXml(xmlfile);
	var bulletml = bml.getElementsByTagName('bulletml')[0];
	if (!bulletml) {
		err('No <bulletml> in the XML: ' + xmlfile);
		return;
	}
	
	objs = [];
	objs.push(player);
	
	var runner = new BulletMLRunner(bulletml);
	var enemy = new Enemy(runner, W / 2, 100, 'g', 0, 0);
	objs.push(enemy);
	
	document.getElementById('dummy').focus();
	
	if (timer) timer.stop();
	timer = new FpsTimer(proc);
};

function showLogo() {
	ctx.drawImage(logoImage, 0, 0, W, H);
}

function init() {
	logoImage = new Image();
	// TODO: support skins.
	logoImage.src = 'img/logo.gif';
	
	createMenu();
	
	//initLog();
	
	//var xmlfile = 'hirahira.xml';
	//var xmlfile = 'hoge.xml';
	//var xmlfile = 'gara5.xml';
	
	player = new Player();
	objs.push(player);
	
	numObjElem = document.getElementById('objs');
	canvasElem = document.getElementById('screen');
	ctx = canvasElem.getContext('2d');
	
	canvasElem.onKeyDown = function(ev) {
		log(ev.keyCode);
	};
	
	rankElem = document.getElementById('rank');
	blurElem = document.getElementById('blur');
	
	setTimeout(showLogo, 100);
}

document.onkeydown = function(ev) {
	if (!ev) return;
	//log(ev.keyCode);
	keyState[ev.keyCode] = 1;
}

document.onkeyup = function(ev) {
	if (!ev) return;
	//log(ev.keyCode);
	keyState[ev.keyCode] = 0;
}
