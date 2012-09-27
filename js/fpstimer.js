function FpsTimer(proc) {
    this.tick = 0;
    this.fps_counter = new Array(24);
    this.fps_counter[0] = new Date().getTime();
    this.fps_index = 0;
    this.proc = proc;
    this.fps = 0;
    this.shouldSkip = false;
    this.running = true;
    this.fpsElem = document.getElementById('fps');

    log('timer inited');
    this.startTime = new Date().getTime();
    this.id = setTimeout(proc, 16);
}

FpsTimer.prototype.wait = function() {
    if (!this.running) {
        return;
    }

    this.tick++;
    var now = new Date().getTime();
    var prev = this.fps_counter[this.fps_index];
    var elapsed = now - prev;
    var w = 16 - elapsed;

    this.fps_index = (this.fps_index + 1) % 24;
    var next = this.fps_counter[this.fps_index];
    this.fps_counter[this.fps_index] = now;
    if (next) {
        this.fps = 24 / (now - next) * 1000;
        //this.fps = this.tick / ((now - this.startTime) / 1000);
        if (this.tick % 10 == 0) {
            this.fpsElem.value = (timer.fps+'').substr(0,5);
        }
    }

    if (this.shouldSkip) {
        this.shouldSkip = false;
    }
    else {
        this.shouldSkip = w <= 0;
    }

    if (this.shouldSkip || w <= 0) {
        this.id = setTimeout(this.proc, 1);
    }
    else {
        this.id = setTimeout(this.proc, w);
    }
};

FpsTimer.prototype.stop = function() {
    log('stopped');
    this.running = false;
    clearTimeout(this.id);
};
