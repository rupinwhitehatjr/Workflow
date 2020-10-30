$(document).ready(function(){
    getGIF()
});
keywordList=["success", "FTW", "elation"]

function getGIF() {
       keywordLength=keywordList.length
       randomKeywordIndex=Math.floor(Math.random() * keywordLength);  
       searchInput=keywordList[randomKeywordIndex]
        var xhr = $.get("https://api.giphy.com/v1/gifs/search?q='" + searchInput + "'&api_key=lGCVXIjnlS5aLwupl2Sjv005dNle3svM&limit=50");
        // var xhr = $.get("http://api.giphy.com/v1/gifs/search?q=ironman&api_key=lGCVXIjnlS5aLwupl2Sjv005dNle3svM&limit=30");

        xhr.done(function(response) { 
        var jiffs = response.data;
            //console.log(jiffs)
            numberofGifs=jiffs.length
            if(numberofGifs===0)
            {
                return 0
            }
            index=Math.floor(Math.random() * numberofGifs);
            //console.log(jiffs[index].images.original.url)  
            $('#gifholder').append("<img src='"+jiffs[index].images.original.url+"' class='gif'/>");
        });
       
}

