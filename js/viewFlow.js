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
                .where("visible", "==", true)
                .orderBy("index")
                .get()

stepsDocument.then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        step=doc.data()
        step_id=doc.id
        //console.log(step)
        stepName=step["name"]
        stepForm=$("<form/>")
        
        //create a Dynamic Div for every Step
        stepholder=$("<div/>")
                    .attr("class", 'step container_12')
                    .attr("id", doc.id)
                    
        
        $(stepForm).append(stepholder)

        //Insert the div before the comment section
        $(stepForm).insertBefore("#commentssection")
        
        stepNameDiv=$("<div/>")
                    .attr("class", "grid_12 stepheader")
                    .text(stepName)
        $(stepholder).append($(stepNameDiv))
        fieldsList=step["fields"]
        numberOfFields=fieldsList.length
        $("#fieldCount").val(numberOfFields)
        for (i=0;i<numberOfFields;i++)
        {
            createField(step_id, fieldsList[i], i)
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

function createField(stepid, fieldMeta, index)
{
    type=fieldMeta["type"]
    label=fieldMeta["label"]
    $("#"+stepid).append(
                $('<div/>')
                .attr("class", "grid_4 fieldlabel")
                .append(label)
            )
    if(type=="dropdown")
    {
        
        div=$('<div/>').attr("class", "grid_6 field")

        options=fieldMeta["options"];
        mandatory=fieldMeta["mandatory"]
        
        dd=$("<select/>")
                .attr("data-stepid",stepid)
                .attr("data-index", index)
                .attr("id", index)
        if(mandatory)
        {
            $(dd).attr("required", true)
        }        
        $(dd).append($("<option/>"))
        for(index=0;index<options.length;index++)
        {
            $(dd).append($("<option/>").val(options[index]).text(options[index]))
        }
        $("#"+stepid).append($(div).append($(dd)))

        //Create a div to go to next line.
        

    }
    if(type=="text")
    {
        
        div=$('<div/>').attr("class", "grid_6 field")

        inputBox=$('<input/>')
                .attr("type", "text")
                .attr('class', 'inputbox')
                .attr("data-stepid",stepid)
                .attr("data-index", index)
                .attr("id", index)
        //console.log($(inputBox))        
        if(mandatory)
        {
            $(inputBox).attr("required", true)
        } 
        $("#"+stepid).append($(div).append($(inputBox)))

        //Create a div to go to next line.
       

    }
     $("#"+stepid).append($('<div/>').attr("class", "clear"))
}
