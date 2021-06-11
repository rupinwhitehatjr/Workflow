$(document).ready(function(){



});

$(document).on("formloaded", function(event){

	/*//console.log("formloaded");
	//console.log($("form"));
	$("form").each(function(){
		
		console.log($(this));
		//$(this).
	

	});*/
	
});



/*$(document).on('change', 'select', function() {
    //console.log($(this).attr("data-stepid"))
});

$(document).on('change', 'input', function() {
    //console.log($(this).attr("data-stepid"))
    data={}
    data["stepid"]=$(this).attr("data-stepid")
    data["index"]=$(this).attr("data-index")
    data["value"]=$(this).val()

});*/

function userAction(action)
{
	primaryForm=$("form")

	if($(primaryForm).length>0)
	{
		validationResult=$("form").valid();
		if(!validationResult)
		{
			return 0
		}
	}
	openSavingModal();

	var stepID=null;
	fieldCount=$("#fieldCount").val()
	fieldCount=parseInt(fieldCount)
	fieldData=[];

	for(index=0;index<fieldCount;index++)
	{
		fieldValue=$("#"+index).val()
		stepID=$("#"+index).attr("data-stepid")
		if(!fieldValue)
		{
			fieldValue=null
		}

		fieldData.push(fieldValue)

	}
	//console.log(fieldData)
	params=getParams(window.location.href)
	flowID=params.id
	//console.log(flowID)
	//console.log(stepID)

	//Save the Data to the Specific Step
	approvedData={}
	approvedData["fieldValues"]=fieldData
	approvedData["action"]=action
	//approvedData["action"]="approved"
	approvedData["by"]=getLoggedInUserObject()// common.js
	//approvedData["notify"]=getLoggedInUserObject()// common.js
	approvedData["timestamp"]=Date.now();
	approvedData["flowID"]=flowID
	
	console.log(stepID)
	if(stepID===null)
	{
		stepID=$("#activestepid").val()
		//console.log(stepID)
	}

	if(stepID===undefined)
	{
		stepID=null
	}
	//console.log($("form").attr("data-stepid"))
	//console.log($("form"))
	//return
	approvedData["stepID"]=stepID
	commenttext=$("#new_comment_input").val()
	commenttext=commenttext.trim()
	//console.log(commenttext)
	if(commenttext!=="")
	{
		console.log("adding a comment")
		commentmeta={}
		commentmeta["by"]=getLoggedInUserObject()// common.js
		commentmeta["timestamp"]=Date.now();
		commentmeta["comment"]=commenttext
		db.collection("Workflows")
		.doc(flowID)
		.collection("comments")
		.doc()
		.set(commentmeta)
	approvedData["commentMeta"]=commentmeta

	}

	// On approved save checklist response on step
	const setChecklistResponse = (flowType) => {
		if (action === 'approved') {
			var radioButtonInput = $('input:radio')
			var checklistResponse = new Array();
			var questionNo = 0;

			for (var i = 0; i < radioButtonInput.length; i += 2) {

				if ($(radioButtonInput[i]).is(':checked')) {
					checklistResponse[questionNo] = $(radioButtonInput[i]).attr('value');
				}

				else if ($(radioButtonInput[i + 1]).is(':checked')) {
					checklistResponse[questionNo] = $(radioButtonInput[i + 1]).attr('value');
				}

				else {
					checklistResponse[questionNo] = "N/A";
				}

				questionNo++;
			}

			let checklistResponseRef = db.collection("ChecklistResponse").doc()
			let checklistResponseDocument = db.collection("ChecklistResponse").doc(checklistResponseRef.id)
			checklistResponseDocument.set({ checklistResponse: checklistResponse, flowID: flowID, stepID: stepID, flowType: flowType })

			db.collection("Workflows")
				.doc(flowID)
				.collection("steps")
				.doc(stepID)
				.update({ checklistResponse: checklistResponseRef })
		}
	}

	
	
	
	
	
	console.log(approvedData)
	cacheDocRef=db.collection("Cache").doc()	
	cacheDocument=db.collection("Cache").doc(cacheDocRef.id)	
	cacheDocument.set(approvedData)
	console.log(cacheDocRef.id)
	//console.log(approvedData)

	
	
		
	
	/*stepdDocument=db.collection("Workflows")
		.doc(flowID)
		.collection("steps")
		.doc(stepID)
		*/

	//console.log(approvedData)	
	//stepdDocument.update(approvedData)

	

	//
	

	facade=db.collection("Workflows").doc(flowID)
	
	unsubscribe=facade.onSnapshot(function(doc) {
        //var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        //console.log(source, " data: ", doc.data());
        console.log(doc.metadata.hasPendingWrites)
		setChecklistResponse(doc.data()['flowType'])
        if(!doc.metadata.hasPendingWrites)
        {
            
                    
            unsubscribe()
            //console.log("we are ready");
            //console.log(doc_ref.id)
            //location.reload(); 
            URL="dummyPage.html"
    		window.location.replace(URL)	
                    
                
        }
});
	flowMeta={}
	flowMeta["ready"]=true
	flowMeta["updated_on"]=Date.now()
	facade.update(flowMeta)
		
}





