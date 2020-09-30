$(document).ready(function(){

 params=getParams(window.location.href)
flow_id=params.id
//window.setInterval(checkResultReady, 3000);
unsubscribe=db.collection("Workflows").doc(flow_id)
    .onSnapshot(function(doc) {
        //var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        //console.log(source, " data: ", doc.data());
        console.log(doc.metadata.hasPendingWrites)
        if(!doc.metadata.hasPendingWrites)
        {
            if(doc.data().ready)

                {
                    //console.log("we are ready");
                    $(document).trigger("dataready");
                    unsubscribe()
                }
        }
});



    

});

$(document).on("dataready", function(event){

    displayWorkflow();
    
});

function checkResultReady()
{
    //ready=db.collection("Workflows").doc(flow_id)
    console.log("Checking");
}


function displayWorkflow()
{
    params=getParams(window.location.href)
    flow_id=params.id
    populateSteps(flow_id)
    populateLogs(flow_id)
    //$(document).trigger("formloaded");
}

function populateSteps(flow_id)
{
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
       
        stepState=step["activestep"]
        if(stepState)
        {
            createEditableStep(doc)
        }
        else
        {
            createViewableStep(doc)
        }
        
    });
});
    
}

function populateLogs(flow_id)
{
    logDocument=db.collection("Workflows")
                .doc(flow_id)
                .collection("log")
                .orderBy("timestamp")
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

        if(action==="Approved")
        {
            stepName=log["stepName"]
            logText=creatorName +" "+ action.toLowerCase() +" the " +stepName + " step at "+hrts
            //console.log(logText)
            appendLogHTML(logText)
        }

        if(action==="Rejected")
        {
            stepName=log["stepName"]
            logText=creatorName +" "+ action.toLowerCase() +" the " +stepName + " step at "+hrts
            //console.log(logText)
            appendLogHTML(logText)
        }

        if(action==="Closed")
        {
           
            logText=creatorName +" "+ action.toLowerCase() +" the  workflow at "+hrts
            //console.log(logText)
            appendLogHTML(logText)
        }

    });
});
}

function createEditableStep(stepDoc)
{
        //The whole logic assumes there will always be one form
        // Because there can only be one step which is actionable.
        stepID=stepDoc.id
        var stepForm=$("<form/>").attr("data-stepid",stepID)
       
        stepContent=stepDoc.data()
        //create a Dynamic Div for every Step
        var stepholder=$("<div/>")
                    .attr("class", 'step container_12')
                    .attr("id", stepID)
                    
        var stepName=stepContent["name"]
        $(stepForm).append(stepholder)

        //Insert the div before the comment section
        $(stepForm).insertBefore("#commentssection")
        
        var stepNameDiv=$("<div/>")
                    .attr("class", "grid_12 stepheader-active")
                    .text(stepName)
        $(stepholder).append($(stepNameDiv))

        fieldsList=stepContent["fields"]
        numberOfFields=fieldsList.length
        $("#fieldCount").val(numberOfFields)
        for (i=0;i<numberOfFields;i++)
        {
            createField(stepID, fieldsList[i], i)
        }
        createHiddenField(stepID);
}

function createViewableStep(stepDoc)
{

        stepID=stepDoc.id
        stepContent=stepDoc.data()
        //create a Dynamic Div for every Step
        var stepholder=$("<div/>")
                    .attr("class", 'step container_12')
                    .attr("id", stepID)
                    
        var stepName=stepContent["name"]
        

        //Insert the div before the comment section
        $(stepholder).insertBefore("#commentssection")
        
        var stepNameDiv=$("<div/>")
                    .attr("class", "grid_12 stepheader")
                    .text(stepName)

        $(stepholder).append($(stepNameDiv))

        fieldList=stepContent["fields"]
        fieldData=stepContent["fieldValues"]
        numberOfFields=fieldList.length
        //$("#fieldCount").val(numberOfFields)
        for (i=0;i<numberOfFields;i++)
        {
            viewField(stepID,fieldList[i], fieldData[i])
        }

}

function appendLogHTML(logText)
{
	
	//console.log(logText)
	$("#actionlist").append($('<div/>').attr("class", "grid_1"))
	$("#actionlist").append($('<div/>').attr("class", "grid_10 logtext").append(logText))
	$("#actionlist").append($('<div/>').attr("class", "grid_1"))
	
}

//Create a hidden field inside the form
function createHiddenField(stepid)
{
    $("#"+stepid).append(
                $('<input/>')
                .attr("type", "hidden")
                .val(stepid)
            )
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
                .attr("name", index)
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
                .attr("name", index)
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



function viewField(stepID,fieldsList, fieldData)
{
    
    label=fieldsList["label"]
    value=fieldData;
    $("#"+stepID).append(
                $('<div/>')
                .attr("class", "grid_4 fieldlabel")
                .append(label)
            )
    
        
     
    
    
        
        div=$('<div/>').attr("class", "grid_6 field").append(value)

        
        //console.log($(inputBox))        
        
        $("#"+stepID).append($(div))

        //Create a div to go to next line.
       

    
     $("#"+stepID).append($('<div/>').attr("class", "clear"))
}
