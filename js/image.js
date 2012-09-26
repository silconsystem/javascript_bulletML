function newImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

function getBallImage(name) {
    // TODO: support skin.
    log(name);
    return newImage('bmp/default/' + name + '.gif');
}

var IMAGES = {
    g:  getBallImage('ball_g'),
    r:  getBallImage('ball_r'),
    w:  getBallImage('ball_w'),
    wb: getBallImage('ball_wb'),
    wg: getBallImage('ball_wg'),
    wr: getBallImage('ball_wr'),
    ws: getBallImage('ball_ws')
};
