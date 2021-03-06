var logElem = null;

function initLog() {
    var infoElem = document.getElementById('error_log');
    infoElem.innerHTML +=
        '<br><textarea id="log" cols="29" rows="5"></textarea>';
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
