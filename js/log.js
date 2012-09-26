var logElem = null;

function initLog() {
    var infoElem = document.getElementById('info2');
    infoElem.innerHTML +=
        '<br><textarea id="log" cols="40" rows="10"></textarea>';
    logElem = document.getElementById('log');
}

function log(msg) {
    if (!logElem) {
        return;
    }
    logElem.value = msg + "\n" + logElem.value;
}

function inspect(obj) {
    var a = [];
    for (k in obj) {
        a.push(k + ': ' + obj[k]);
    }
    return '{' + a.join(', ') + '}';
}

function err(msg) {
    errElem = document.getElementById('err');
    errElem.innerHTML = '<span style="color:red">' + msg + '</span>';
    clearTimeout();
}

function check(b, msg) {
    if (!b) {
        err('Check failed: ' + msg);
    }
}
