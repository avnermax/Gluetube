// Construção da tabela e execução do vídeo
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var score = [];

var Video = {
    url: "",
    startTime: 0,
    endTime: 0,
    repeat: 0,
    volume: 0,
    posx: 0,
    posy: 0,
    width: 0,
    height: 0,
    schedule: 0
};

function addVideo(e) {
    var video = Object.create(Video);
    video.url = document.getElementById('url').value;
    video.startTime = parseFloat(document.getElementById('startTime').value);
    video.endTime = parseFloat(document.getElementById('endTime').value);
    video.repeat = parseFloat(document.getElementById('repeat').value);
    video.volume = parseFloat(document.getElementById('volume').value);
    video.posx = parseFloat(document.getElementById('posx').value);
    video.posy = parseFloat(document.getElementById('posy').value);
    video.width = parseFloat(document.getElementById('width').value);
    video.height = parseFloat(document.getElementById('height').value);
    video.schedule = parseFloat(document.getElementById('schedule').value * 1000);
    score.push(video);
    showScore();
}

function loadScore() {
    var e = document.getElementById("file-input");
    var file = e.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        score = JSON.parse(contents);
        showScore();
    };
    reader.readAsText(file);
}


function saveScore() {
    var jsonString = JSON.stringify(score);
    var blob = new Blob([jsonString], {
        type: "text/xml"
    });
    var anchor = document.createElement("a");
    anchor.download = "my-score.gt";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = "_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function showScore() {
    var table = document.getElementById("score");

    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    // Add labels
    const keys = Object.keys(Video);
    var header = table.createTHead();
    var newRow = header.insertRow(-1);
    for (const key of keys) {
        let newCell = newRow.insertCell(-1);
        let newText = document.createTextNode(key);
        newCell.appendChild(newText);
    }

    // Add values
    for (var i = 0; i < score.length; i++) {
        let video = score[i];
        let values = Object.values(video);
        var newRow = table.insertRow(-1);
        for (const value of values) {
            let newCell = newRow.insertCell(-1);
            let newText = document.createTextNode(value);
            newCell.appendChild(newText);
        }
        let newCell = newRow.insertCell(-1);
        let button_edit = document.createElement("button");
        button_edit.innerHTML = "E";
        button_edit.onclick = editVideo;
        newCell.appendChild(button_edit);
        let button_remove = document.createElement("button");
        button_remove.innerHTML = "X";
        button_remove.onclick = removeVideo;
        newCell.appendChild(button_remove);
    }
}

function removeVideo(event) {
    score.splice(event.target.idContainer, 1); // Erro - Está removendo sempre o primeiro item.
    showScore();
}

function editVideo(event) {
    //
}

var times = [];

function playScore() {
    stopScore();
    for (var i = 0; i < score.length; i++) {
        const video = score[i];
        const count = i;
        var time = setTimeout(function() {
            play(video, count);
        }, video.schedule);
        times.push(time);
    }
}

function stopScore() {
    for (var i = 0; i < times.length; i++) {
        clearTimeout(times[i]);
    }
    times = [];
}

function play(video, index) {
    var idPlayer = 'player' + index;
    var idContainer = 'container_video' + index;
    var title_idContainer = idContainer + '_title';
    if (video.repeat != 0) var loopAux = video.repeat;

    // DIV Container do video e titulo.
    var element = document.createElement('div');
    element.setAttribute('id', idContainer);
    element.setAttribute('class', 'dragDiv');
    element.style.left = video.posx;
    element.style.top = video.posy;
    document.getElementById('ytplayer').appendChild(element);

    // DIV barra de move up.
    var element_barUp = document.createElement('div');
    element_barUp.setAttribute('id', title_idContainer);
    element_barUp.setAttribute('class', 'barDiv');
    document.getElementById(idContainer).appendChild(element_barUp);

    // DIV video.
    var element_video = document.createElement('div');
    element_video.setAttribute('id', idPlayer);
    // element_video.style.height = "100%" + 20;
    // element_video.style.width = "100%";
    document.getElementById(idContainer).appendChild(element_video);

    // Movimenta o DIV passado por parâmetro.
    dragElement(document.getElementById(idContainer));

    player = new YT.Player(idPlayer, {
        host: 'http://www.youtube.com',
        height: "100%",
        width: "100%",
        videoId: video.url,
        playerVars: {
            modestbranding: 0, // Hide the Youtube Logo
            fs: 1, // Hide the full screen button
            controls: 1, // Show pause/play buttons in player
            showinfo: 1, // Hide the video title
            rel: 0, // Hide related videos
            cc_load_policy: 0, // Hide closed captions
            iv_load_policy: 3, // Hide the Video Annotations
            autohide: 0, // Hide video controls when playing
            autoplay: 1, // Auto-play the video on load
            end: video.endTime,
        },
        events: {
            onReady: function(e) {
                e.target.setVolume(video.volume);
                e.target.seekTo(video.startTime);
                e.target.playVideo();
            },
            onStateChange: function(e) {
                if (e.data === YT.PlayerState.ENDED && loopAux > 0) {
                    loopAux--;
                    e.target.seekTo(video.startTime);
                    e.target.playVideo();
                } else {
                    if (e.data === YT.PlayerState.ENDED && video.repeat == 0) {
                        e.target.seekTo(video.startTime);
                        e.target.playVideo();
                    }
                }
                if (loopAux == 0) {
                    e.target.stopVideo();
                    var node = document.getElementById(idContainer);
                    if (node.parentNode) {
                      node.parentNode.removeChild(node);
                    }
                }
            }
        }
    });
}

// Faz o movimento do DIV.
function dragElement(element) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById(element.id + '_title')) {
        // if present, the header is where you move the DIV from:
        document.getElementById(element.id + '_title').onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
