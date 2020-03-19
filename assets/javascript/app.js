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
var db = firebase.database();

// sample authorization for client verification -> ignore this
// https://accounts.spotify.com/en/authorize?client_id=aa373cd188254322a46c8e258cd404a9&redirect_uri=https:%2F%2Fjwellstx.github.io%2FProject1%2Fcallback&response_type=token&state=123

var db = firebase.database();
var song1votes = 0;
var song2votes = 0;

// just lets the DB know that someone has connected and to get a new access_token from firebase cloud functions
db.ref("newuser").update({
    state: true
});

// this just checks if anyone has already voted, if not set initial values to 0
// also, check if 2 songs already exist, if so, use those.  If none defined, generate new ones
db.ref("spotify").once("value", snapshot => {
    var dbRef = snapshot.val();

    // checks for song1votes existence
    song1votes = snapshot.child("song1votes").exists() ? dbRef.song1votes : 0;
    song2votes = snapshot.child("song1votes").exists() ? dbRef.song2votes : 0;

    // check to make sure boths songs are selected, if not generate new songs
    if (snapshot.child("song1").exists()) {
        $("#s1").attr("src", dbRef.song1);
        $("#s1Img").append($("<img>").attr("src", dbRef.song1Img));
        $("#s1Search").hide();
        $("#s1").show();
    }
    else {
        $("#s1Search").show();
    }
    if (snapshot.child("song2").exists()) {
        $("#s2").attr("src", dbRef.song2);
        $("#s2Img").append($("<img>").attr("src", dbRef.song2Img));
        $("#s2Search").hide();
        $("#s2").show();
    }
    else {
        $("#s2Search").show();
    }
    if (snapshot.child("song1").exists() && snapshot.child("song2").exists()) {
        $("#s1Votes, #s2Votes").show();
    }
});

$("#s1Submit").on("click", function () {
    var access_token = "";   // access token to call spotify api 
    var songurl = "https://open.spotify.com/embed/track/";      // url to get song track
    var song1Name = $("#s1Name").val().trim();
    $("s1Search").hide();

    db.ref().once("value", snapshot => {
        // when new songs are needed, get the id and pass from DB and encode it for api call
        var dbRef = snapshot.val();
        access_token = dbRef.newuser.access_token;
    }).then(function () {
        // this function takes the access token and does a spotify api call to get a new song, then updated #song1
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + song1Name + '&type=track&limit=1&offset=0',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                // Update song1 with spotify song
                $("#s1").attr("src", songurl + response.tracks.items[0].id);
                $("#s1Img").html($("<img>").attr("src", response.tracks.items[0].album.images[1].url));
                // Update song1 url in DB so we can sync across users
                db.ref("spotify").update({
                    song1: songurl + response.tracks.items[0].id,
                    song1Img: response.tracks.items[0].album.images[1].url
                });
                $("#s1Search").hide();
                $("#s1").show();
            }

        });
    });
});
$(document).on("keyup", "#s1Name", function (event) {
    if (event.key !== "Enter") return;
    $('#s1Submit').click();
    event.preventDefault();
});

$("#s2Submit").on("click", function () {
    var access_token = "";   // access token to call spotify api 
    var songurl = "https://open.spotify.com/embed/track/";      // url to get song track
    var song2Name = $("#s2Name").val().trim();

    db.ref().once("value", snapshot => {
        // when new songs are needed, get the id and pass from DB and encode it for api call
        var dbRef = snapshot.val();
        access_token = dbRef.newuser.access_token;
    }).then(function () {
        // same as previous function but for second song
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + song2Name + '&type=track&limit=1&offset=0',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                console.log(response.tracks.items[0].album.images[2].url);
                $("#s2").attr("src", songurl + response.tracks.items[0].id);
                $("#s2Img").html($("<img>").attr("src", response.tracks.items[0].album.images[1].url));
                db.ref("spotify").update({
                    song2: songurl + response.tracks.items[0].id,
                    song2Img: response.tracks.items[0].album.images[1].url
                });
                $("#s2Search").hide();
                $("#s2, #s2votes").show();
            }
        });
    });
});
$(document).on("keyup", "#s2Name", function (event) {
    if (event.key !== "Enter") return;
    $('#s2Submit').click();
    event.preventDefault();
});

// button to vote for song 1 - if pressed, update number of song1 votes then update DB
// to reflect across users
$("#s1VoteSubmit").on('click', function () {
    var voted = localStorage.getItem("hasvoted");

    if (voted) return;
    else {
        song1votes++;
        // prevent users from voting multiple times
        // localStorage.setItem("hasvoted", true);
    }
    db.ref("spotify").update({
        song1votes: song1votes,
    });

});

// button to vote for song 2 - if pressed, update number of song2 votes then update DB
// to reflect across users
$("#s2VoteSubmit").on('click', function () {
    var voted = localStorage.getItem("hasvoted");

    if (voted) return;
    else {
        song2votes++;
        // prevent users from voting multiple times
        // localStorage.setItem("hasvoted", true);
    }
    db.ref("spotify").update({
        song2votes: song2votes,
    });
});

// Update num of votes for each song on webpage when someone clicks the vote button.
// also if song votes for either one hit 15, announce winner then call newSongs to get new songs
// then reset vote count to 0
db.ref("spotify").on("value", snapshot => {
    if (snapshot.child("song1").exists() && snapshot.child("song2").exists()) {
        $("#s1Votes, #s2Votes").show();
    }

    if (snapshot.child("song1votes").exists()) {
        $("#s1NumOfVotes").html(snapshot.val().song1votes);
        song1votes = snapshot.val().song1votes;
    }
    if (snapshot.child("song2votes").exists()) {
        $("#s2NumOfVotes").html(snapshot.val().song2votes);
        song2votes = snapshot.val().song2votes;
    }

    if (song1votes == 15) {
        db.ref("spotify").update({
            song1votes: 0,
            song2votes: 0,
            song1: null,
            song2: null,
            song1Img: null,
            song2Img: null,
        });
        // push winner here to db
        $("#s1Search, #s2Search").show();
        $("#s1, #s1Votes, #s2, #s2Votes").hide();
        
        var img  = $("#s1Img img").attr("src");
        var song = $("#s1").attr("src");
        db.ref("winners").push({
            song: song,
            img: img
        });

        $("#s1Img, #s2Img").empty();
    }
    else if (song2votes == 15) {
        db.ref("spotify").update({
            song1votes: 0,
            song2votes: 0,
            song1: null,
            song2: null,
            song1Img: null,
            song2Img: null,
        });
        // push winner here to db
        $("#s1Search, #s2Search").show();
        $("#s1, #s1Votes, #s2, #s2Votes").hide();

        var img  = $("#s2Img img").attr("src");
        var song = $("#s2").attr("src");
        db.ref("winners").push({
            song: song,
            img: img
        });

        $("#s1Img, #s2Img").empty();
    }
});

db.ref("winners").on("child_added", snapshot => {
    var newDiv = $("<div>");
    newDiv.append($("<img>").attr("src", snapshot.val().img));
    newDiv.append($("<br>"));
    newDiv.append($("<iframe>").attr("src", snapshot.val().song).css("height", "80"));
    newDiv.css({"float": "left", "margin": "2%"});

    $("#winners").prepend(newDiv);
});