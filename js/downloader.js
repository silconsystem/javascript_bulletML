function createXmlHttp ()
{
    var xmlhttp = null;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }

    return xmlhttp;
}

function download(req, randomize) {
    var xmlhttp = createXmlHttp();
    if (randomize) {
        req += '?' + Math.random();
    }
    xmlhttp.open("GET", req, false);
    xmlhttp.send(null);
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        return xmlhttp;
    }
    else {
        log('Failed to download: ' + req);
        return null;
    }
}

function downloadXml(req) {
    var xmlhttp = download(req);
    if (xmlhttp) {
        return xmlhttp.responseXML;
    }
    else {
        return null;
    }
}

function downloadJson(req) {
    var xmlhttp = download(req);
    if (xmlhttp) {
        return eval(xmlhttp.responseText);
    }
    else {
        return null;
    }
}
