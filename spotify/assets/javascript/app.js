var spotify = {
    song1votes: 0,
    song2votes: 0,
    Play: () => {
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
        // https://accounts.spotify.com/en/authorize?client_id=<client_id>&redirect_uri=https:%2F%2Fjwellstx.github.io%2FProject1%2Fcallback&response_type=token&state=123

        // just lets the DB know that someone has connected and to get a new access_token 
        // from firebase cloud functions which calls spotify token api endpoint
        db.ref("newuser").update({
            state: true
        });

        spotify.initGame(db);
        spotify.setupSubmitListenersAndSongSelection(db, "1");
        spotify.setupSubmitListenersAndSongSelection(db, "2");
        spotify.setupVoteButtonListeners(db);
        spotify.setupDBlistenerAndWinnerChecker(db);

    },
    initGame: (db) => {
        /*
            Purpose: Check if song1 and/or song2 exists and their corresponding votes in firebase db.
                     If so, modify pay to show current selected songs and num of votes.  The purpose
                     of this is to setup the page for new users
            Input: db reference
            Output: None; Just modifying html
        */
        db.ref("spotify").once("value", snapshot => {
            var dbRef = snapshot.val();

            // checks for song1votes existence
            spotify.song1votes = snapshot.child("song1votes").exists() ? dbRef.song1votes : 0;
            spotify.song2votes = snapshot.child("song1votes").exists() ? dbRef.song2votes : 0;

            // check to make sure boths songs are selected, if not wait for both songs to be selected
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
            // lets the voting begin!!
            if (snapshot.child("song1").exists() && snapshot.child("song2").exists()) {
                $("#s1Votes, #s2Votes").show();
            }
        });
    },
    setupSubmitListenersAndSongSelection: (db, songNum) => {
        /*
            Purpose: Listens to submit boxes for new song selections, does a a new spotify
                     api query to the track endpoint, returns the track and album art and 
                     displays it to the screen.
            Input: db reference
                   songNum: String notifiying us if this is related to song1 or song2
            Ouput: None
        */
        $("#s" + songNum + "Submit").on("click", function () {
            var access_token = "";   // access token to call spotify api 
            var songurl = "https://open.spotify.com/embed/track/";      // url to get song track
            var songName = $("#s" + songNum + "Name").val().trim();

            db.ref().once("value", snapshot => {
                // when new songs are needed, get the id and pass from DB and encode it for api call
                var dbRef = snapshot.val();
                access_token = dbRef.newuser.access_token;
            }).then(function () {
                // this function takes the access token and does a spotify api call to get a new song, then updated #song1
                $.ajax({
                    url: 'https://api.spotify.com/v1/search?q=' + songName + '&type=track&limit=1&offset=0',
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    success: function (response) {
                        // Update song selector with the album art and spotify player
                        $("#s" + songNum).attr("src", songurl + response.tracks.items[0].id);
                        $("#s" + songNum + "Img").html($("<img>").attr("src", response.tracks.items[0].album.images[1].url));
                        // Update song information in DB so we can sync across users
                        if (songNum === "1") {
                            db.ref("spotify").update({
                                song1: songurl + response.tracks.items[0].id,
                                song1Img: response.tracks.items[0].album.images[1].url
                            });
                        }
                        if (songNum === "2") {
                            db.ref("spotify").update({
                                song2: songurl + response.tracks.items[0].id,
                                song2Img: response.tracks.items[0].album.images[1].url
                            });
                        }
                        // Hide search bars until next round
                        $("#s" + songNum + "Search").hide();
                        $("#s" + songNum).show();
                    }
                });
            });
        });
        // forces a click if someone wants to hit enter instead of clicking submit
        $(document).on("keyup", "#s" + songNum + "Name", function (event) {
            if (event.key !== "Enter") return;
            $('#s' + songNum + 'Submit').click();
            event.preventDefault();
        });
    },
    setupVoteButtonListeners: (db) => {
        /*
            Purpose: When songs are being voted on, listen to vote button and update db.
                     Also prevent users from voting multiple times using local storage
            Input: db reference
            Output: None
        */
        $("#s1VoteSubmit").on('click', function () {
            var voted = localStorage.getItem("hasvoted");

            if (voted) return;
            else {
                spotify.song1votes++;
                // prevent users from voting multiple times
                localStorage.setItem("hasvoted", true);
            }
            db.ref("spotify").update({
                song1votes: spotify.song1votes,
            });

        });

        $("#s2VoteSubmit").on('click', function () {
            var voted = localStorage.getItem("hasvoted");

            if (voted) return;
            else {
                spotify.song2votes++;
                // prevent users from voting multiple times
                localStorage.setItem("hasvoted", true);
            }
            db.ref("spotify").update({
                song2votes: spotify.song2votes,
            });
        });
    },
    setupDBlistenerAndWinnerChecker: (db) => {
        /*
            Purpose: Update num of votes for each song on webpage when someone clicks the vote button.
                     also if song votes for either one hit 15, announce winner, enable search bar again
                     for new songs to vote for.  Reset song counts to 0.
            Input: db reference
            Output: None;
        */
        db.ref("spotify").on("value", snapshot => {
            if (snapshot.child("song1").exists() && snapshot.child("song2").exists()) {
                $("#s1Votes, #s2Votes").show();
            }

            if (snapshot.child("song1votes").exists()) {
                $("#s1NumOfVotes").html(snapshot.val().song1votes);
                spotify.song1votes = snapshot.val().song1votes;
            }
            if (snapshot.child("song2votes").exists()) {
                $("#s2NumOfVotes").html(snapshot.val().song2votes);
                spotify.song2votes = snapshot.val().song2votes;
            }

            if (spotify.song1votes === 15) {
                spotify.winner(db, "1");
            }
            else if (spotify.song2votes === 15) {
                spotify.winner(db, "2");
            }
        });
        
        // Use song and album urls from the db to update the winners selector win someone wins. Limit 10
        db.ref("winners").endAt().limitToLast(12).on("child_added", snapshot => {
            $("#winner").empty();
            var newDiv = $("<div>");
            newDiv.append($("<img>").attr("src", snapshot.val().img));
            newDiv.append($("<br>"));
            newDiv.append($("<iframe>").attr("src", snapshot.val().song).css("height", "80"));
            newDiv.css({ "float": "left", "margin": "2%" });
            $("#winners").prepend(newDiv);
        });
    },
    winner: (db, songNum) => {
        /*
            Purpose: Reset DB values for next competition, enable search bars, hide voting buttons
                     and push winner song and album to firebase to be displays on the page.
            Input: db reference
                   songNum: String notifiying us if this is related to song1 or song2
            Output: None
        */
        db.ref("spotify").update({
            song1votes: 0,
            song2votes: 0,
            song1: null,
            song2: null,
            song1Img: null,
            song2Img: null,
        });
        $("#s1Search, #s2Search").show();  // enable search bar
        $("#s1Name, #s2Name").val("New Search");  // reset placeholder value from previous value
        $("#s1, #s1Votes, #s2, #s2Votes").hide();  // disable votes until both songs selected

        // get both img and spotify src attr to store in the db as a winner
        var img = $("#s" + songNum + "Img img").attr("src");
        var song = $("#s" + songNum).attr("src");
        db.ref("winners").push({
            song: song,
            img: img
        });

        // corner case to stop song if it max votes reached
        // otherwise it will keep playing forever
        $("#s1, #s2").attr("src", "");
        $("#s1Img, #s2Img").empty();
    },
}

$(() => {
    spotify.Play();
})





/*


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

///////////////////////////////////////////////////////////////////////////////


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

                var img = $("#s2Img img").attr("src");
                var song = $("#s2").attr("src");
                db.ref("winners").push({
                    song: song,
                    img: img
                });

                // corner case to stop song if it max votes reached
                // otherwise it will keep playing forever
                $("#s1, #s2").attr("src", "");
                $("#s1Img, #s2Img").empty();
            }
*/