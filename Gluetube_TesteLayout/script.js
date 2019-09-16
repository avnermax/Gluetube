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

function initTable() {
    var table = document.getElementById("score");

    // Add labels in the table
    const keys = Object.keys(Video);
    var header = table.createTHead();
    var newRow = header.insertRow(-1);
    for (const key of keys) {
        let newCell = document.createElement("th");
        if(key == "url") newCell.innerHTML = "URL";
        if(key == "startTime") newCell.innerHTML = "Start Time";
        if(key == "endTime") newCell.innerHTML = "End Time";
        if(key == "repeat") newCell.innerHTML = "Repeat";
        if(key == "volume") newCell.innerHTML = "Volume";
        if(key == "posx") newCell.innerHTML = "PosX";
        if(key == "posy") newCell.innerHTML = "PosY";
        if(key == "width") newCell.innerHTML = "Width";
        if(key == "height") newCell.innerHTML = "Height";
        if(key == "schedule") newCell.innerHTML = "Schedule";
        newRow.appendChild(newCell);
    }
    let newCellEdit = document.createElement("th");
    newCellEdit.innerHTML = "Editar";
    newRow.appendChild(newCellEdit);
    let newCellRemove = document.createElement("th");
    newCellRemove.innerHTML = "Remove";
    newRow.appendChild(newCellRemove);
}

function addRow() {
    var v = Object.create(Video);
    console.log(v.url);
    v.url = "";
    v.startTime = 0;
    v.endTime = 0;
    v.repeat = 1;
    v.volume = 50;
    v.posx = 10;
    v.posy = 10;
    v.width = 400;
    v.height = 300;
    v.schedule = 0 * 1000;
    score.push(v);

    var table = document.getElementById("score");

    // Add values in the table
    let video = score[score.length - 1];
    let values = Object.values(video);
    var c = 0;
    var newRow = table.insertRow(-1);
    console.log(values);
    for (const value of values) {
        c = c + 1;
        let newCell = newRow.insertCell(-1);
        var input = document.createElement("input");
        if (c == 1) {
            input.id = "url";
            input.type = "text";
            input.className = "input_text";
        }else{
            input.type = "number";
            input.className = "input_number";
        }
        input.value = value;
        newCell.appendChild(input);
    }
    let newCellEdit = newRow.insertCell(-1);
    let button_edit = document.createElement("button");
    button_edit.innerHTML = "E";
    button_edit.onclick = editVideo;
    newCellEdit.appendChild(button_edit);

    let newCellRemove = newRow.insertCell(-1);
    let button_remove = document.createElement("button");
    button_remove.innerHTML = "X";
    button_remove.onclick = removeVideo;
    newCellRemove.appendChild(button_remove);
}

function showScore() {
    var table = document.getElementById("score");

    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    // Add values in the table
    for (var i = 0; i < score.length; i++) {
        let video = score[i];
        let values = Object.values(video);
        var c = 0;
        var newRow = table.insertRow(-1);
        for (const value of values) {
            c = c + 1;
            let newCell = newRow.insertCell(-1);
            var input = document.createElement("input");
            if (c == 1) {
                input.id = "url";
                input.type = "text";
                input.className = "input_text";
            }else{
                if (c == 2) input.id = "startTime";
                if (c == 3) input.id = "endTime";
                if (c == 4) input.id = "repeat";
                if (c == 5) input.id = "volume";
                if (c == 6) input.id = "posx";
                if (c == 7) input.id = "posy";
                if (c == 8) input.id = "width";
                if (c == 9) input.id = "height";
                if (c == 10) input.id = "schedule";
                input.value = value;
                input.type = "number";
                input.className = "input_number";
            }
            newCell.appendChild(input);
        }
        let newCellEdit = newRow.insertCell(-1);
        let button_edit = document.createElement("button");
        button_edit.innerHTML = "E";
        button_edit.onclick = editVideo;
        newCellEdit.appendChild(button_edit);

        let newCellRemove = newRow.insertCell(-1);
        let button_remove = document.createElement("button");
        button_remove.innerHTML = "X";
        button_remove.onclick = removeVideo;
        newCellRemove.appendChild(button_remove);
    }
}

function removeVideo(event) {
    score.splice(event.target.idContainer, 1); // Erro - Está removendo sempre o primeiro item.
    showScore();
    initTable();
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
            playVideo(video, count);
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

function playVideo(video, index) {
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

    // DIV titulo.
    var element_title = document.createElement('div');
    element_title.setAttribute('id', title_idContainer);
    element_title.setAttribute('class', 'titleDiv');
    document.getElementById(idContainer).appendChild(element_title);
    // var textnode = document.createTextNode('MOVE');
    // document.getElementById(title_idContainer).appendChild(textnode);

    // DIV video.
    var element_video = document.createElement('div');
    element_video.setAttribute('id', idPlayer);
    document.getElementById(idContainer).appendChild(element_video);

    // Movimenta o DIV passado por parâmetro.
    dragElement(document.getElementById(idContainer));

    player = new YT.Player(idPlayer, {
        host: 'http://www.youtube.com',
        height: video.height,
        width: video.width,
        videoId: video.url,
        playerVars: {
            modestbranding: 0, // Hide the Youtube Logo
            fs: 1, // Hide the full screen button
            controls: 1, // Show pause/play buttons in player
            showinfo: 1, // Hide the video title
            rel: 0, // Hide related videos
            cc_load_policy: 0, // Hide closed captions
            iv_load_policy: 3, // Hide the video annotations
            autohide: 0, // Hide video controls when playing
            autoplay: 1, // Auto-play the video on load
            end: video.endTime,
        },
        events: {
            onReady: function(e) {
                e.target.setVolume(video.volume); // 0 ~ 100
                e.target.playVideo();
                e.target.seekTo(video.startTime);
            },
            onStateChange: function(e) {
                if (e.data === YT.PlayerState.ENDED && loopAux > 0) {
                    loopAux--;
                    e.target.playVideo();
                    e.target.seekTo(video.startTime);
                } else {
                    if (e.data === YT.PlayerState.ENDED && video.repeat == 0) {
                        e.target.playVideo();
                        e.target.seekTo(video.startTime);
                    }
                }
                if (loopAux == 0) {
                    e.target.stopVideo();
                    document.getElementById(idPlayer).setAttribute("style", "display:none;");
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
