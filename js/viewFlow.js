$(document).ready(function(){

params=getParams(window.location.href)
flow_id=params.id
flowDocument=db.collection("Workflows")
				.doc(flow_id)
				.collection("log")
				.orderBy("timestamp", "desc")
				.get()

flowDocument.then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        log=doc.data();
        action=log["action"]
        creatorName=log["creatorName"]
        timestamp=log["timestamp"]
        hrts=new Date(parseInt(timestamp));
        if(action==="Created")
        {
        	logText=creatorName +" "+ action.toLowerCase() +" this workflow on " +hrts
        	//console.log(logText)
        	appendLogHTML(logText)
        }

    });
});





});

function appendLogHTML(logText)
{
	
	console.log(logText)
	$("#actionlist").append($('<div/>').attr("class", "grid_1"))
	$("#actionlist").append($('<div/>').attr("class", "grid_10 logtext").append(logText))
	$("#actionlist").append($('<div/>').attr("class", "grid_1"))
	
}
