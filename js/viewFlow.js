$(document).ready(function(){

params=getParams(window.location.href)
//console.log(params)
flow_id=params.id
logDocument=db.collection("Workflows")
				.doc(flow_id)
				.collection("log")
				.orderBy("timestamp", "desc")
				.get()

logDocument.then(function(querySnapshot) {
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

stepsDocument=db.collection("Workflows")
                .doc(flow_id)
                .collection("steps")
                .orderBy("index")
                .get()

stepsDocument.then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        step=doc.data()
        //console.log(step)
        stepName=step["name"]
        //create a Dynamic Div for every Step
        stepholder=$("<div/>")
                    .attr("class", 'step container_12')
                    .attr("id", doc.id)
        //Insert the div before the comment section
        $(stepholder).insertBefore("#commentssection")
        stepNameDiv=$("<div/>").attr("class", "grid_12 stepheader").text(stepName)
        $(stepholder).append($(stepNameDiv))
        fieldsList=step["fields"]
        for (i=0;i<fieldsList.length;i++)
        {
            createField(doc.id, fieldsList[i])
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

function createField(elementid, fieldMeta)
{
    type=fieldMeta["type"]
    label=fieldMeta["label"]
    $("#"+elementid).append(
                $('<div/>')
                .attr("class", "grid_4 fieldlabel")
                .append(label)
            )
    if(type=="dropdown")
    {
        
        div=$('<div/>').attr("class", "grid_6 field")

        options=fieldMeta["options"];
        
        dd=$("<select/>")
        for(index=0;index<options.length;index++)
        {
            $(dd).append($("<option/>").val(options[index]).text(options[index]))
        }
        $("#"+elementid).append($(div).append($(dd)))

        //Create a div to go to next line.
        

    }
    if(type=="text")
    {
        
        div=$('<div/>').attr("class", "grid_6 field")

        inputBox=$('<input/>').attr("type", "text").attr('class', 'inputbox')
        
        $("#"+elementid).append($(div).append($(inputBox)))

        //Create a div to go to next line.
       

    }
     $("#"+elementid).append($('<div/>').attr("class", "clear"))
}
