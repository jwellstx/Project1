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
});



var queryUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=surfing&type=video&key=AIzaSyD_hRyR6sbL4dXjrTlyjFNU4Z5uxR6C1Sw' 
// --header 'Authorization: Bearer [YOUR_ACCESS_TOKEN]' \
// --header 'Accept: application/json' \
// --compressed

$.ajax({
    url: queryUrl,
    method: "Get"    
}).done(function(response){
    console.log(response);
for(var i = 0; i < items.length; i++){
    var video1 = $("<div>").response.item[i];
    console.log(video1);
    }
})
