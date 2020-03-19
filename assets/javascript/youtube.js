var firebaseConfig = {
    apiKey: "AIzaSyD_hRyR6sbL4dXjrTlyjFNU4Z5uxR6C1Sw",
    authDomain: "project-1-271405.firebaseapp.com",
    databaseURL: "https://project-1-271405.firebaseio.com",
    projectId: "project-1-271405",
    storageBucket: "project-1-271405.appspot.com",
    messagingSenderId: "152697641744",
    appId: "1:152697641744:web:80faaa2f0589f1973ca395"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  db.ref("youtube").once("value", snapshot => {
    var dbRef = snapshot.val();

    var video1votes = 0;
    var video2votes = 0;

    // checks for video1votes existence
    if (snapshot.child("video1votes").exists()) {
        video1votes = dbRef.video1votes;
    }
    else {
        video1votes = 0;
    }

    // checks for video2votes existence
    if (snapshot.child("video2votes").exists()) {
        video2votes = dbRef.video2votes;
    }
    else {
        video2votes = 0;
    }

    // check to make sure boths videos are selected, if not generate new videos
    if (!snapshot.child("video1").exists() || !snapshot.child("video2").exists()) {
        newvideos();
    }
    else {
        $("#video1").attr("src", dbRef.video1);
        $("#video2").attr("src", dbRef.video2);
    }

    db.ref("youtube").set({video1votes, video2votes});
});


function newvideos(){
var queryUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=surfing&type=video&key=AIzaSyD_hRyR6sbL4dXjrTlyjFNU4Z5uxR6C1Sw'; 
// --header 'Authorization: Bearer [YOUR_ACCESS_TOKEN]' \
// --header 'Accept: application/json' \
// --compressed
db.ref().once("value", snapshot => {
    var dbRef = snapshot.val();
}).then(function(){
$.ajax({
    url: queryUrl,
    method: "Get"    
}).done(function(response){
   // console.log(response.items[Math.random() * response.items.length]);
var pickVideo1 = response.items[Math.floor(Math.random() * response.items.length)].id.videoId;
var pickVideo2 = response.items[Math.floor(Math.random() * response.items.length)].id.videoId;
// console.log(pickVideo1);

$("#player1").attr("src", "http://www.youtube.com/embed/" + pickVideo1);
$("#player2").attr("src", "http://www.youtube.com/embed/" + pickVideo2);
})
})
}
