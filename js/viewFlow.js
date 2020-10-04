$(document).ready(function(){


openWaitingModal();
params=getParams(window.location.href)
flow_id=params.id
//window.setInterval(checkResultReady, 3000);
unsubscribe=db.collection("Workflows").doc(flow_id)
    .onSnapshot(function(doc) {
        //var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        //console.log(source, " data: ", doc.data());
        //console.log(doc.metadata.hasPendingWrites)
        if(!doc.metadata.hasPendingWrites)
        {
            if(doc.data().ready)

                {
                    //console.log("we are ready");
                    
                    $(document).trigger("dataready", doc);
                    unsubscribe()
                }
        }
});



    

});

$(document).on("dataready", function(event, doc){

    //console.log(doc.data())
    workflowMeta=doc.data()
    displayBreadCrumbs(workflowMeta)

  //  addHiddenFieldForStepID(workflowMeta["active_step_id"])
    displayWorkflow();
    
    
});


$(document).on("formloaded", function(event){

    closeAllModals()
    
    
});

function openWaitingModal()
{
    $("#loading").modal({
        escapeClose: false,
        clickClose: false,
        showClose: false
    });
}

function openSavingModal()
{
    $("#saving").modal({
        escapeClose: false,
        clickClose: false,
        showClose: false
    });
}

function closeAllModals()
{
    $.modal.close();
}

function checkResultReady()
{
    //ready=db.collection("Workflows").doc(flow_id)
    console.log("Checking");
}


function displayWorkflow()
{
    params=getParams(window.location.href)
    flow_id=params.id
    //displayBreadCrumbs(flow_id)
    populateSteps(flow_id)
    populateLogs(flow_id)
    appendComments(flow_id)

    $(document).trigger("formloaded");
}

function displayBreadCrumbs(doc_data)
{
    stepMeta=doc_data["allSteps"]
    stepCount=stepMeta.length
    activeStepID=doc_data["active_step_id"]
    closedState=doc_data["closed"]
    
    var activeFlag=false;
    for(i=0;i<stepCount;i++)
    {
        activeFlag=false
        step_name=stepMeta[i]["name"]
        step_ID=stepMeta[i]["id"]

        if(step_ID===activeStepID)
        {
            activeFlag=true
            
        }

        createBreadCrumb(step_name, step_ID,activeFlag)
    }
    
    // Workflow is closed, no need of showing buttons
    //console.log(closedState)
    if(closedState)
    {
       // console.log("removing section")
        $("#buttonsection").remove()
    }
    else
    {
        $("#buttonsection").removeClass("invisible")
    }
}

function addHiddenField(id, value)
{
    console.log(id+" " +value);
    var hiddenElement=$("<input/>").attr("type", "hidden")
                  .attr("value", value)
                  .attr("id", id)

    $("body").append($(hiddenElement))
}

function createBreadCrumb(stepName,id,isActive)
{
    stepcrumb=$("<li/>").text(stepName)
    if(isActive)
    {
        $(stepcrumb).attr("class", "current")
    }
    $("#breadcrumb").append(stepcrumb)
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
        //set a default value for the number of fields.
        

        stepState=step["activestep"]
        isReviewOnly=step["onlyreview"]
        //console.log("isReviewOnly: "+isReviewOnly)
        if(!isReviewOnly)
        {
            if(stepState)
            {
               // console.log("Editable step")
                createEditableStep(doc)
                
            }
            else
            {
                //console.log("Viewable step")
                createViewableStep(doc)
            }
        }
        //Step is a review step and is active
        //just add hidden fields
        if(isReviewOnly && stepState)
        {
            addHiddenField("fieldCount", 0)
            addHiddenField("activestepid", step_id)
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

function appendComments(flow_id)
{

    commentDocument=db.collection("Workflows")
                .doc(flow_id)
                .collection("comments")
                .orderBy("timestamp")
                .get()

    commentDocument.then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            comment=doc.data();
            comment_text=comment["comment"]
            creatorName=comment["name"]
            timestamp=comment["timestamp"]

            hrts=new Date(parseInt(timestamp));

            commentdiv=$("<div/>").attr("class", "grid_12 commenttext").text(comment_text)
            blankdiv=$("<div/>").attr("class", "clear")
            $(commentdiv).insertBefore("#commentinputsec")
            $(blankdiv).insertBefore("#commentinputsec")
        

       

        

    });
});

}

function createEditableStep(stepDoc)
{
        //The whole logic assumes there will always be one form
        // Because there can only be one step which is actionable.
       // console.log("edi6table")
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
                
        for (i=0;i<numberOfFields;i++)
        {
            createField(stepID, fieldsList[i], i)
        }
        addHiddenField("fieldCount", numberOfFields)
        addHiddenField("activestepid", stepID)

        //Add validators to the newly created form.
        $(stepForm).validate({errorElement : 'span', errorClass: "formerror"});
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
        
    
    $("#"+stepID).append(
                $('<div/>')
                .attr("class", "grid_4 fieldlabel")
                .append(label)
            )
    
        
        
        value=fieldData;
        fieldDisplay=null
        if("displayAs" in fieldsList)
        {
            fieldDisplay=fieldsList["displayAs"]
        }

        fieldValue=value;
        if(fieldDisplay==="url")
        {
            fieldValue=$("<a>")
                        .attr("href", value)
                        .attr("class", "fieldlink")
                        .append(value)
        }

        
    
        
        div=$('<div/>').attr("class", "grid_6 field").append(fieldValue)

        
        //console.log($(inputBox))        
        
        $("#"+stepID).append($(div))

        //Create a div to go to next line.
       

    
     $("#"+stepID).append($('<div/>').attr("class", "clear"))
}
