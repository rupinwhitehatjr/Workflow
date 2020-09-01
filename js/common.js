var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};



$(document).ready(function(){

	fillPage();

	params=getParams(window.location.href)

	if(params.question==="5")
	{
		$("#nextButton").hide()
	}
	if(params.question==="1")
	{
		$("#prevButton").hide()
	}

	$(document).on("imagepasted", function(event,additionalData){

		labelID=additionalData["id"]+"label"
		updateImageLink(additionalData["id"], additionalData["data"])
		updateStatus(labelID,false)
		updateField(additionalData)	
	
	})

	$("textarea").change(function()
	{
		eventObj={}
		eventObj.data=$(this).val()
		eventObj.id=$(this).attr("id")
		updateField(eventObj)
	});

	
	key=getBaseKey()
	newKey=key+"/"+"option1fileurl"
	var option1FileChange = firebase.database().ref(newKey);
		option1FileChange.on('value', function(snapshot) {
  			//console.log(snapshot.val());
  			if(snapshot.val())
  			{
  				labelID="option1label"
  				updateStatus(labelID, true)
  			}
	});

	newKey=key+"/"+"option2fileurl"
	var option1FileChange = firebase.database().ref(newKey);
		option1FileChange.on('value', function(snapshot) {
  			//console.log(snapshot.val());
  			if(snapshot.val())
  			{
  				labelID="option2label"
  				updateStatus(labelID, true)
  			}
	});

	newKey=key+"/"+"option3fileurl"
	var option1FileChange = firebase.database().ref(newKey);
		option1FileChange.on('value', function(snapshot) {
  			//console.log(snapshot.val());
  			if(snapshot.val())
  			{
  				labelID="option3label"
  				updateStatus(labelID, true)
  			}
	});

	newKey=key+"/"+"option4fileurl"
	var option1FileChange = firebase.database().ref(newKey);
		option1FileChange.on('value', function(snapshot) {
  			//console.log(snapshot.val());
  			if(snapshot.val())
  			{
  				labelID="option4label"
  				updateStatus(labelID, true)
  			}
	});	
	
})

function getBaseKey()
{
	params=getParams(window.location.href)
	key=params.level + "/"+params.class +"/"+params.question
	return key
}

function updateField(additionalData)
{
		params=getParams(window.location.href)
		key=params.level + "/"+params.class +"/"+params.question			
		key=key+ "/" +additionalData["id"]		
		firebase.database().ref(key).set(additionalData["data"]);
}

function fillPage()
{
	params=getParams(window.location.href)

	console.log(params.level)
	//console.log(params.version)
	console.log(params.class)
	console.log(params.question)

	$("#curriculum").html(params.level)
	$("#QuestionNumber").html(params.question)
	$("#class").html(params.class)

	



	key=params.level + "/"+params.class +"/"+params.question
	
	//console.log(key)
	var questionData = firebase.database().ref(key);

	questionData.once('value').then(function(snapshot) 

	{

		existingValue=snapshot.val()
		//console.log(existingValue)
		if(!existingValue)
		{
			return;
		}


		var keyList = Object.keys(existingValue)
		for (i=0;i<keyList.length;i++)
		{
			//console.log(keyList[i])
			if($("#"+keyList[i]))
			{
				$("#"+keyList[i]).val(existingValue[keyList[i]])
			}
			if(keyList[i]==="option1fileurl")
			{
				//console.log("Option 1 File URL")
				updateImageLink("option1", existingValue[keyList[i]])
			}
			if(keyList[i]==="option2fileurl")
			{
				//console.log("Option 2 File URL")
				updateImageLink("option2", existingValue[keyList[i]])
			}
			if(keyList[i]==="option3fileurl")
			{
				//console.log("Option 3 File URL")
				updateImageLink("option3", existingValue[keyList[i]])
			}
			if(keyList[i]==="option4fileurl")
			{
				//console.log("Option 4 File URL")
				updateImageLink("option4", existingValue[keyList[i]])
			}
			if(keyList[i]==="questionImagefileurl")
			{
				//console.log("Option 4 File URL")
				updateImageLink("questionImage", existingValue[keyList[i]])
			}
			
					
		}

		
	  
	});
}




function updateImageLink(containerID, fileURL, uploaded=false)
{
	$myDiv = $("#"+containerID)
	$myDiv.css('background-image', 'none');
	children=$myDiv.children()

	//console.log($("#"+containerID+">img"))

	$("#"+containerID+">img").remove();



	labelID=containerID+"label"
	/*var label=document.createElement("p")
	label.setAttribute("class", "instructions")
	label.innerHTML="Click and Paste Your Question Image Here"
	
	label.setAttribute("id", labelID)
		
	$myDiv.append(label); */
	//updateStatus(labelID,true)

	var img = document.createElement('img'); 
	img.src =fileURL
	img.setAttribute('class', 'optionimage');
		
	$myDiv.append(img); 
}

function updateStatus(id, status)
{
	//console.log($("#"+id+">img"))
	if(status)
	{
		$("#"+id+">img").attr("src", "img/check.png").show();
	}
	if(!status)
	{
		$("#"+id+">img").attr("src", "img/loading.gif").show();
	}	

}

function goToNext()
{
	params=getParams(window.location.href)
	currentURL=window.location.href
	currentQuestion=params.question
	prevQuestion=parseInt(currentQuestion)+1

	nextURL=currentURL.replace("question="+currentQuestion,"question="+prevQuestion)
	window.location.href=nextURL
}

function goToPrev()
{
	params=getParams(window.location.href)
	currentURL=window.location.href
	currentQuestion=params.question
	prevQuestion=parseInt(currentQuestion)-1

	prevURL=currentURL.replace("question="+currentQuestion,"question="+prevQuestion)
	window.location.href=prevURL

	
}

function goHome()
{
	params=getParams(window.location.href)
	var fileName = window.location.href.split("/").slice(-1);
	
	currentURL=window.location.href
	homeURL=currentURL.replace(fileName,params.level +".html")
	window.location.href=homeURL

}