




var firebaseConfig = {
    apiKey: "AIzaSyBTFg6x0Ndb220S1wjri0hRB2ldmQQ2mds",
    authDomain: "project1-battles.firebaseapp.com",
    databaseURL: "https://project1-battles.firebaseio.com",
    projectId: "project1-battles",
    storageBucket: "project1-battles.appspot.com",
    messagingSenderId: "492185445748",
    appId: "1:492185445748:web:e42c41dafba90b020d3821"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// var song1votes = 0;
// var song2votes = 0;
var offset = 0;

var db = firebase.database();
db.ref("spotify").once("value", snapshot => {
    var dbRef = snapshot.val();

    if (dbRef.song1votes) {
        song1votes = dbRef.song1votes;
    }
    else {
        song1votes = 0;
    }

    if (dbRef.song2votes) {
        song2votes = dbRef.song2votes;
    }
    else {
        song2votes = 0;
    }
});

var songurl = "https://open.spotify.com/embed/track/";
// var offset = Math.floor(Math.random() * 30);


// only run ajax call once timer runs out
newSongs(); // just to refresh for now
var timer = setInterval(newSongs, 10 * 1000);

function newSongs() {
    var x = 10;
    var timer2 = setInterval(function () { 
        console.log(x);
        x--;

        $("#timer").html(x);

        if (x === 0) {
            db.ref("spotify").once("value", snapshot => { 
                var dbRef = snapshot.val();
                console.log(dbRef.song1votes, dbRef.song2votes);
                if (parseInt(dbRef.song1votes) > parseInt(dbRef.song2votes)) {
                    console.log("Song 1 Wins!!");
                    $("#winners").prepend("Song 1 Won!<br>");
                }
                else if (parseInt(dbRef.song2votes) > parseInt(dbRef.song1votes)) {
                    console.log("Song 2 Wins!!");
                    $("#winners").prepend("Song 2 Won!<br>");
                }
                else if (parseInt(dbRef.song2votes) === parseInt(dbRef.song1votes)) {
                    console.log("Its a tie!! overtime?");
                    $("#winners").prepend("It's a tie! Everyone Wins!<br>")
                }
            });

           
            clearInterval(timer2);
            db.ref("spotify").update({
                song1votes: 0,
                song2votes: 0,
            });
        }
    }, 1000);


    console.log("picking new songs");
    $.ajax({
        url: 'https://api.spotify.com/v1/search?q=muse&type=track&limit=1&offset=' + offset,
        headers: {
            'Authorization': 'Bearer ' + 'BQBNtET2QDLqxr7smC8h9YAp1Nl4H5XpRwgEQXWfzF3_Q8sejDNcMTwloeYkNNXeocXn3AcHF-YCNNIGZrKiKCzJtyNbUpuCvNsul4_BXBeoY7zOzAU7ov3iVzvNpJKHuj_JWnNURjhxGN-YLxxfyw'
        },
        success: function (response) {
            $("#song1").attr("src", songurl + response.tracks.items[0].id);
        }
    }).then(function (response) {
        // var offset = Math.floor(Math.random() * 30);
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=post%20malone&type=track&limit=1&offset=' + offset,
            headers: {
                'Authorization': 'Bearer ' + 'BQBNtET2QDLqxr7smC8h9YAp1Nl4H5XpRwgEQXWfzF3_Q8sejDNcMTwloeYkNNXeocXn3AcHF-YCNNIGZrKiKCzJtyNbUpuCvNsul4_BXBeoY7zOzAU7ov3iVzvNpJKHuj_JWnNURjhxGN-YLxxfyw'
            },
            success: function (response) {
                $("#song2").attr("src", songurl + response.tracks.items[0].id);
            }
        });
    }).then(function(response2){
        offset++;
    });
}

$("#votedsong1").on('click', function () {
    var voted = localStorage.getItem("hasvoted");

    if (voted) return;
    else {
        song1votes++;
        // localStorage.setItem("hasvoted", true);
    }
    db.ref("spotify").update({
        song1votes: song1votes,
    });

});
$("#votedsong2").on('click', function () {
    var voted = localStorage.getItem("hasvoted");

    if (voted) return;
    else {
        song2votes++;
        // localStorage.setItem("hasvoted", true);
    }
    db.ref("spotify").update({
        song2votes: song2votes,
    });
});

db.ref("spotify").on("value", snapshot => {
    if (snapshot.child("song1votes").exists()) {
        $("#song1votes").html(snapshot.val().song1votes);
        song1votes = snapshot.val().song1votes;
    }
    if (snapshot.child("song2votes").exists()) {
        $("#song2votes").html(snapshot.val().song2votes);
        song2votes = snapshot.val().song2votes;
    }
    
    
// vote is over function
// need to stop the page until something happens. mb ask if the users want to start new contest
// because i noticed that timer runnning over and over again so it runs nonstop 
// are we going to store the wiiner songs?


// i have a pic of what to do, just need help to jump start



});


