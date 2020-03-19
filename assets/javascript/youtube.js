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