// falta cambiar la funcion "StringToIntYTVidDuration" a una definicion que use expresiones regulares
// lo mismo se aplica para la obtencion de la ID de la playlist

function addTime(time1,time2){
  time1.s += time2.s;
  time1.m += time2.m;
  time1.h += time2.h;
}

function StringToIntYTVidDuration(original) {
    let last = original.length -1
    let hrs,mns,sec;
  
    if (original[last] == "S") { // se fija si se dellataron segundos
      sec = parseInt(original[last-1]);
      if (parseInt(original[last-2])){
        sec += parseInt(original[last-2])*10;
        last--;
      };
      last--; // una vez por la letra del segundo que se saco
      last--; // otra vez por el segundo que se saco
    } else sec = 0;
  
    if (original[last] == "M") { // se fija si se dellataron minutos
      mns = parseInt(original[last-1]);
      if (parseInt(original[last-2])){
        mns += parseInt(original[last-2])*10;
        last--;
      };
      last--; // una vez por la letra del minutos que se saco
      last--; // otra vez por el minutos que se saco
    } else mns = 0;
  
    if (original[last] == "H") { // se fija si se dellataron horas
      hrs = parseInt(original[last-1]);
      if (parseInt(original[last-2])){
        hrs += parseInt(original[last-2])*10;
        last--;
      };
      last--; // una vez por la letra de la hora que se saco
      last--; // otra vez por la hora que se saco
    } else hrs = 0;
  
    if (parseInt(original[1])){
      hrs += parseInt(original[1]) * 24; 
    }
  
    return {h: hrs, m:mns, s: sec}
  }
  
  function getTokenDuration(playlistLink){
    const timeSum = {h:0,m:0,s:0};
    service.playlistItems.list({
      'part':[
        'snippet, contentDetails'
      ],
      'playlistId' : playlistLink,
      'maxResults' : '50',
      'pageToken' : nextPageToken
    }, (err,res) => {
      if (err) return console.log('g error' + err);
      nextPageToken = res.data.nextPageToken;
      const videos = res.data.items;
      if (videos.length){
        let vidIdArray = [];
  
        videos.map(video => {
            vidIdArray.push(video.contentDetails.videoId)
          })
  
        service.videos.list({
          'part' : 'contentDetails',
          'id' : vidIdArray
        }).then(function(response){
          mainRes = response.data.items;
          mainRes.map( video => {
            const currentVidDuration = StringToIntYTVidDuration(video.contentDetails.duration);
            addTime(timeSum,currentVidDuration)
          })          
        })
      }
    })
    return timeSum
  }
  
const {google} = require('googleapis');
const service = google.youtube({
  version: 'v3',
  auth: 'api key'// la mejor opcion es guardarla en un .env por motivos de seguridad
});

var nextPageToken;

  function main(){  
    let playlistLink = 'https://www.youtube.com/playlist?list=PL2MHu9iz8B8d1p7-LsmoeSENUTCoVJ6Id';
  
    for (index in playlistLink){ // consigue la ID de la playlist
      if (playlistLink[index] == "=") {
        playlistLink = playlistLink.substr(parseInt(index)+1,playlistLink.length);
        break
      }      
    };
  
    console.log(playlistLink);

    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    const getFullPlaylistLength = async () => {
      const totalPlaylistLength = {h:0,m:0,s:0};      
      do {
        let currentTokenLength = getTokenDuration(playlistLink)
        await sleep(3000)
        addTime(totalPlaylistLength,currentTokenLength)
        console.log(totalPlaylistLength)
      } while (nextPageToken != undefined);
    }

    getFullPlaylistLength()
}

main();