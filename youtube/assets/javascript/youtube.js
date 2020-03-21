$(document).ready(function () {
    $("#player1").hide();
    $("#player2").hide();
    $(".votes1").hide();
    $(".votes2").hide();
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
    db.ref("youtube").once("value", snapshot => {
        var dbRef = snapshot.val();
        // var video1votes = 0;
        // var video2votes = 0;
        // checks for video1votes existence
        if (snapshot.child("video1votes").exists()) {
            video1votes = dbRef.video1votes;
        } else {
            video1votes = 0;
        }
        // checks for video2votes existence
        if (snapshot.child("video2votes").exists()) {
            video2votes = dbRef.video2votes;
        } else {
            video2votes = 0;
        }
        // check to make sure boths videos are selected, if not generate new videos
        if (snapshot.child("video1").exists()) {
            $("#player1").show();
            $(".search1").hide();
            $(".votes1").show();
            $("#player1").attr("src", dbRef.video1)
        }
        if (snapshot.child("video2").exists()) {
            $("#player2").show();
            $(".search2").hide();
            $(".votes2").show();
            $("#player2").attr("src", dbRef.video2);
        }
        // db.ref("youtube").set({
        //     video1votes,
        //     video2votes,
        //     video1,
        //     video2
        // });
    });
    // db.ref("youtube").on("value", snapshot => {
    //     if (!snapshot.child("player1").exists() && !snapshot.child("player2").exists()) {
    //         $(".votes1, .votes2").show();
    //     }
    // })
    var video1;
    $(".submit1").on("click", function () {
        video1 = $("#v1Input").val().trim();
        console.log(video1);
        $("#player1").show();
        $(".search1").hide();
        $(".votes1").show();
        newvideos1();
    })

    function newvideos1() {
        // var video = ["surfing", "skateboarding", "skiing"]
        var queryUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=' + video1 + '&type=video&key=AIzaSyD_hRyR6sbL4dXjrTlyjFNU4Z5uxR6C1Sw';
        // --header 'Authorization: Bearer [YOUR_ACCESS_TOKEN]' \
        // --header 'Accept: application/json' \
        // --compressed
        db.ref().once("value", snapshot => {
            var dbRef = snapshot.val();
        }).then(function () {
            $.ajax({
                url: queryUrl,
                method: "Get"
            }).done(function (response) {
                // console.log(response.items[Math.random() * response.items.length]);
                var pickVideo1 = response.items[Math.floor(Math.random() * response.items.length)].id.videoId;
                $("#player1").attr("src", "https://www.youtube.com/embed/" + pickVideo1);

                db.ref("youtube").update({
                    video1: "https://www.youtube.com/embed/" + pickVideo1,

                })
            })
        })
    }
    var video2;
    $(".submit2").on("click", function () {
        video2 = $("#v2Input").val().trim();
        newvideos2();
        console.log(video2);
        $("#player2").show();
        $(".search2").hide();
        $(".votes2").show();
    })

    function newvideos2() {
        var queryUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=' + video2 + '&type=video&key=AIzaSyD_hRyR6sbL4dXjrTlyjFNU4Z5uxR6C1Sw';
        db.ref().once("value", snapshot => {
            var dbRef = snapshot.val();
        }).then(function () {
            $.ajax({
                url: queryUrl,
                method: "Get"
            }).done(function (response) {
                var pickVideo2 = response.items[Math.floor(Math.random() * response.items.length)].id.videoId;
                $("#player2").attr("src", "https://www.youtube.com/embed/" + pickVideo2);
                db.ref("youtube").update({
                    video2: "https://www.youtube.com/embed/" + pickVideo2

                })
            })
        })
    }
    $("#video1VoteSubmit").on('click', function () {
        var voted = localStorage.getItem("hasvoted");
        if (voted) return;
        else {
            video1votes++;
            // prevent users from voting multiple times
            localStorage.setItem("hasvoted", true);
        }
        db.ref("youtube").update({
            video1votes: video1votes,
        });
    });
    $("#video2VoteSubmit").on('click', function () {
        var voted = localStorage.getItem("hasvoted");
        if (voted) return;
        else {
            video2votes++;
            // prevent users from voting multiple times
            localStorage.setItem("hasvoted", true);
        }
        db.ref("youtube").update({
            video2votes: video2votes,
        });
    });
    db.ref("youtube/video1votes").on("value", function (snapshot) {
        video1votes = snapshot.val();
        $("#video1votes").html(snapshot.val());
        if (video1votes == 15) {
            var video = $("#player1").attr("src");
            // console.log(video);
            localStorage.removeItem("hasvoted");
        }
        if (video1votes == 15) {
            db.ref("youtube").update({
                video1votes: 0,
                video2votes: 0,
                video1: null,
                video2: null
            })
            $(".search1, .search2").show();
            $("#player1, #player2").hide();
            $(".votes1, .votes2").hide();


        }
        // 
    })
    db.ref("winnersYT").endAt().limitToLast(8).on("child_added", snapshot => {
        var newDiv = $("<div>");
        newDiv.append($("<iframe>").attr("src", snapshot.val().video).css({"height": "250", "width": "360"}));
        newDiv.css({
            "float": "left",
            "margin": "10px"
        });
        $("#winners").prepend(newDiv);
        $("#latestWinner").empty();

        $("#latestWinner").append(newDiv.clone());
    });
    db.ref("youtube/video2votes").on("value", function (snapshot) {
        // snapshot.val();
        video2votes = snapshot.val();
        $("#video2votes").html(snapshot.val());
        if (snapshot.val() === 15) {
            db.ref("youtube").update({
                video1votes: 0,
                video2votes: 0,
                video1: null,
                video2: null
            })
            $(".search1, .search2").show();
            $("#player1, #player2").hide();
            $(".votes1, .votes2").hide();
            localStorage.removeItem("hasvoted");
        }



    });
    

})
