$(document).ready(function(){






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


function reject()
{
	//Just read the comment section
	//add to the log
	//send back to selected step.
}
function approve()
{
	//check mandatory values
	//read all fields
	//save field values in the specific step
	//send forward
	var stepID;
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

	db.collection("Workflows")
		.doc(flowID)
		.collection("steps")
		.doc(stepID)
		.update({"fieldValues":fieldData})
}
