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


var offset = 0;
var db = firebase.database();

// this just checks if anyone has already voted, if not set initial values to 0
// also, check if 2 songs already exist, if so, use those.  If none defined, generate new ones
db.ref("spotify").once("value", snapshot => {
    var dbRef = snapshot.val();

    // checks for song1votes existence
    if (snapshot.child("song1votes").exists()) {
        song1votes = dbRef.song1votes;
    }
    else {
        song1votes = 0;
    }

    // checks for song2votes existence
    if (snapshot.child("song2votes").exists()) {
        song2votes = dbRef.song2votes;
    }
    else {
        song2votes = 0;
    }

    // check to make sure boths songs are selected, if not generate new songs
    if (!snapshot.child("song1").exists() || !snapshot.child("song2").exists()) {
        newSongs();
    }
    else {
        $("#song1").attr("src", dbRef.song1);
        $("#song2").attr("src", dbRef.song2);
    }
});



function newSongs() {
    var encoded = "";  // used for base64 to ascii conversion for api key
    var access_token = "";   // access token to call spotify api 
    var songurl = "https://open.spotify.com/embed/track/";      // url to get song track


    // bunch of chained calls
    db.ref().once("value", snapshot => {
        // when new songs are needed, get the id and pass from DB and encode it for api call
        var dbRef = snapshot.val();
        encoded = btoa(dbRef.notTheClientId + ':' + dbRef.notTheClientShhhh);
    }).then(function () {
        // Do the first API call to api/token endpoint to get authorization/access token to do api calls
        $.ajax({
            url: 'https://accounts.spotify.com/api/token',
            type: 'POST',
            data: {
                grant_type: "client_credentials",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            headers: {
                Authorization: 'Basic ' + encoded
            },
            dataType: 'json'
        }).then(function (response) {
            // this function takes the access token and does a spotify api call to get a new song, then updated #song1
            access_token = response.access_token;
            $.ajax({
                url: 'https://api.spotify.com/v1/search?q=muse&type=track&limit=1&offset=' + offset,
                method: "GET",
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    // Update song1 with spotify song
                    $("#song1").attr("src", songurl + response.tracks.items[0].id);
                    // Update song1 url in DB so we can sync across users
                    db.ref("spotify").update({
                        song1: songurl + response.tracks.items[0].id,
                    });
                }
            }).then(function (response) {
                // same as previous function but for second song
                $.ajax({
                    url: 'https://api.spotify.com/v1/search?q=post%20malone&type=track&limit=1&offset=' + offset,
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    success: function (response) {
                        $("#song2").attr("src", songurl + response.tracks.items[0].id);
                        db.ref("spotify").update({
                            song2: songurl + response.tracks.items[0].id,
                        });
                    }
                });
            }).then(function (response2) {
                // increase offset by 1 to get a new song -> otherwise we pull the same song every time
                offset++;
            });
        });
    });
}

// button to vote for song 1 - if pressed, update number of song1 votes then update DB
// to reflect across users
$("#votedsong1").on('click', function () {
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
$("#votedsong2").on('click', function () {
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
    if (snapshot.child("song1votes").exists()) {
        $("#song1votes").html(snapshot.val().song1votes);
        song1votes = snapshot.val().song1votes;
    }
    if (snapshot.child("song2votes").exists()) {
        $("#song2votes").html(snapshot.val().song2votes);
        song2votes = snapshot.val().song2votes;
    }

    if (song1votes == 15) {
        $("#winners").prepend("Song 1 won!!<br>");
        db.ref("spotify").update({
            song1votes: 0,
            song2votes: 0,
        });
        newSongs();
    }
    else if (song2votes == 15) {
        $("#winners").prepend("Song 2 won!!<br>");
        db.ref("spotify").update({
            song1votes: 0,
            song2votes: 0,
        });
        newSongs();
    }
});