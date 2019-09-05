// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var score = [];

var Video = {
   url: "",
   startTime: 20,
   endTime: 21,
   repeat: 0,
   posx: 0,
   posy: 0,
   width: 0,
   height: 0,
   schedule: 0
};

function addVideo(e){
   var video = Object.create(Video);
   video.url = document.getElementById('url').value;
   video.startTime = parseFloat(document.getElementById('startTime').value);
   video.endTime = parseFloat(document.getElementById('endTime').value);
   video.repeat = parseFloat(document.getElementById('repeat').value);
   video.posx = parseFloat(document.getElementById('posx').value);
   video.posy = parseFloat(document.getElementById('posy').value);
   video.width = parseFloat(document.getElementById('width').value);
   video.height = parseFloat(document.getElementById('height').value);
   video.schedule = parseFloat(document.getElementById('schedule').value);
   score.push(video);
   showScore();
}

function removeVideo(event){
   score.splice(event.target.innerHTML,1);
   showScore();
}


function loadScore(){
   var e = document.getElementById("file-input");
   var file = e.files[0];
   if(!file){
      return;
   }
   var reader = new FileReader();
   reader.onload = function(e){
      var contents = e.target.result;
      score = JSON.parse(contents);
      showScore();
   };
   reader.readAsText(file);
}


function saveScore(){
   var jsonString = JSON.stringify(score);
   var blob = new Blob([jsonString], { type: "text/xml"});
   var anchor = document.createElement("a");
   anchor.download = "my-score.gt";
   anchor.href = window.URL.createObjectURL(blob);
   anchor.target ="_blank";
   anchor.style.display = "none"; // just to be safe!
   document.body.appendChild(anchor);
   anchor.click();
   document.body.removeChild(anchor);
}

function showScore(){
   var table = document.getElementById("score");

   while(table.rows.length > 0){
      table.deleteRow(0);
   }

   // Add labels
   const keys = Object.keys(Video);
   var header = table.createTHead();
   var newRow = header.insertRow(-1);
   for (const key of keys){
      let newCell = newRow.insertCell(-1);
      let newText = document.createTextNode(key);
      newCell.appendChild(newText);
   }

   // Add values
   for (var i = 0 ; i < score.length ; i++){
      let video = score[i];
      let values = Object.values(video);
      var newRow = table.insertRow(-1);
      for(const value of values){
         let newCell = newRow.insertCell(-1);
         let newText = document.createTextNode(value);
         newCell.appendChild(newText);
      }
      let newCell = newRow.insertCell(-1);
      let button = document.createElement("button");
      button.innerHTML = i;
      button.onclick = removeVideo;
      newCell.appendChild(button);
   }
}

var times = [];
function playScore(){
   stopScore();
   for (var i = 0 ; i < score.length ; i++){
      const video = score[i];
      const count = i;
      var time = setTimeout(function(){
         playVideo(video, count);
         }, video.schedule);
      times.push(time);
   }
}

function stopScore(){
   for (var i = 0 ; i < times.length ; i++){
      clearTimeout(times[i]);
   }
   times = [];
}

function playVideo(video, index){
   console.log(video, index);
   var idPlayer = 'player' + index;
   if (video.repeat != 0) var loopAux = video.repeat;

   var element = document.createElement('div');
   element.setAttribute('id', idPlayer);
   element.style.position = "absolute";
   element.style.left = video.posx;
   element.style.top = video.posy;
   document.getElementById('ytplayer').appendChild(element);

   player = new YT.Player(idPlayer, {
      host: 'http://www.youtube.com',
      height: video.height,
      width: video.width,
      videoId: video.url,
      playerVars: {
         modestbranding: 0, // Hide the Youtube Logo
         fs: 1, // Hide the full screen button
         controls: 0, // Hide pause/play buttons in player
         showinfo: 1, // Hide the video title
         rel: 0, // Hide related videos
         cc_load_policy: 0, // Hide closed captions
         iv_load_policy: 3, // Hide the Video Annotations
         autohide: 0, // Hide video controls when playing
         autoplay: 1, // Auto-play the video on load
         end: video.endTime,
      },
      events: {
         onReady: function(e){
            e.target.playVideo();
            e.target.seekTo(video.startTime);
         },
         onStateChange: function(e) {
            if (e.data === YT.PlayerState.ENDED && loopAux > 0) {
               loopAux--;
               e.target.playVideo();
               e.target.seekTo(video.startTime);
            }else{
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
