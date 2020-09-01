const functions = require('firebase-functions');
const admin = require('firebase-admin');

const AWS = require('aws-sdk');
/*var config = new AWS.Config({
  
  
});*/
admin.initializeApp()
const s3Bucket = new AWS.S3({
   accessKeyId: functions.config().s3.key, 
   secretAccessKey: functions.config().s3.secret 
});
const BUCKET_NAME="quiz-images-automated-upload"


/* Function to Save and Update S3 URL for Option 1 */ 

exports.saveOption1Image = functions.database
  .ref('{curriculum}/{class}/{question}/option1')
  .onCreate((change, context) => {
   
    //let base64String = change.after.val()  
    let base64String = change.val()  
    

    //console.log(context.params.curriculum)
    var partsArray=[]
    partsArray.push(context.params.curriculum)
    partsArray.push(context.params.class)
    partsArray.push(context.params.question)
    partsArray.push("option1")
    var filename=partsArray.join("_")
    

    let status=imageUpload(base64String, filename)
    //console.log("status: "+status)
	if(status===0)
	{
		var filePath="https://"+BUCKET_NAME+".s3.ap-south-1.amazonaws.com/"+filename+".png"
		var key=partsArray.join("/")
		updatedDB(filePath, key)
	}

  });




 /* Function to Save and Update S3 URL for Option 2 */ 

exports.saveOption2Image = functions.database
  .ref('{curriculum}/{class}/{question}/option2')
  .onCreate((change, context) => {
   
    //let base64String = change.after.val()  
    let base64String = change.val()   
    //console.log(context.params.curriculum)
    var partsArray=[]
    partsArray.push(context.params.curriculum)
    partsArray.push(context.params.class)
    partsArray.push(context.params.question)
    partsArray.push("option2")
    var filename=partsArray.join("_")
    

    let status=imageUpload(base64String, filename)
    //console.log("status: "+status)
	if(status===0)
	{
		var filePath="https://"+BUCKET_NAME+".s3.ap-south-1.amazonaws.com/"+filename+".png"
		var key=partsArray.join("/")
		updatedDB(filePath, key)
	}

  });

 /* Function to Save and Update S3 URL for Option 3 */ 

exports.saveOption3Image = functions.database
  .ref('{curriculum}/{class}/{question}/option3')
  .onCreate((change, context) => {
   
    //let base64String = change.after.val()  
    let base64String = change.val()   
    //console.log(context.params.curriculum)
    var partsArray=[]
    partsArray.push(context.params.curriculum)
    partsArray.push(context.params.class)
    partsArray.push(context.params.question)
    partsArray.push("option3")
    var filename=partsArray.join("_")
    

    let status=imageUpload(base64String, filename)
    //console.log("status: "+status)
	if(status===0)
	{
		var filePath="https://"+BUCKET_NAME+".s3.ap-south-1.amazonaws.com/"+filename+".png"
		var key=partsArray.join("/")
		updatedDB(filePath, key)
	}

  });

  /* Function to Save and Update S3 URL for Option 4 */ 

exports.saveOption4Image = functions.database
  .ref('{curriculum}/{class}/{question}/option4')
  .onCreate((change, context) => {
   
    //let base64String = change.after.val()  
    let base64String = change.val()   
    //console.log(context.params.curriculum)
    var partsArray=[]
    partsArray.push(context.params.curriculum)
    partsArray.push(context.params.class)
    partsArray.push(context.params.question)
    partsArray.push("option4")
    var filename=partsArray.join("_")
    

    let status=imageUpload(base64String, filename)
    //console.log("status: "+status)
	if(status===0)
	{
		var filePath="https://"+BUCKET_NAME+".s3.ap-south-1.amazonaws.com/"+filename+".png"
		var key=partsArray.join("/")
		updatedDB(filePath, key)
	}

  });

  /* Function to Save and Update S3 URL for Question Image */ 

exports.saveOptionQuestionImage = functions.database
  .ref('{curriculum}/{class}/{question}/questionImage')
  .onCreate((change, context) => {
   
    //let base64String = change.after.val()  
    let base64String = change.val()   
    //console.log(context.params.curriculum)
    var partsArray=[]
    partsArray.push(context.params.curriculum)
    partsArray.push(context.params.class)
    partsArray.push(context.params.question)
    partsArray.push("questionImage")
    var filename=partsArray.join("_")
    

    let status=imageUpload(base64String, filename)
    //console.log("status: "+status)
	if(status===0)
	{
		var filePath="https://"+BUCKET_NAME+".s3.ap-south-1.amazonaws.com/"+filename+".png"
		var key=partsArray.join("/")
		updatedDB(filePath, key)
	}

  });







  function imageUpload(imageString, filename) {
  	const base64Data = new Buffer.from(imageString.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  	buf = Buffer.from(base64Data) 
	var data = {
		Key: filename+".png", 
		Body: buf,
		ContentEncoding: 'base64',
		ContentType: "image/png", // required. Notice the back ticks
		Bucket: BUCKET_NAME
	};
	try
	{
		s3Bucket.upload(data, function(err, data){
			if(err)
			{
				throw new Error('Upload to S3 Failed');
			}
			
		});
		return 0

	}
	catch(err)
	{
		return -1
	}


	

  }

  function updatedDB(filePath, key)
  {
  		
		

		newKey=key+"fileurl"

		filePath=filePath+ "?d="+Date.now()
		//console.log("key: " +key)
		var db = admin.database();
		db.ref(newKey).set(filePath)

		// Remove the key with the base64 data
		db.ref(key).remove()

  }
