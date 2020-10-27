const functions = require('firebase-functions');
const admin = require('firebase-admin');


const sgMail = require('@sendgrid/mail')
/* admin is initialised in index.js*/
let db = admin.firestore();
let storageObj=admin.storage()
const path = require('path');
const os = require('os');
const fs = require('fs');

//console.log(functions.config())
apikey=functions.config().sendgrid.apikey

  


sgMail.setApiKey(apikey)


exports.sendNotification = functions
  .region('asia-east2')
  .firestore
  .document('NotificationQueue/{notificationid}')
  .onCreate((snapshot, context) => 
  { 



  notificationData=snapshot.data()
  //htmlbody=getHTMLBody(notificationData)  
  
 


  //msgObject={}
  targetStepIndex=notificationData.targetStepIndex
  recipients=notificationData.notify
  flowID=notificationData.flowID 


  if(recipients.length===0)
  {
    /* fetch the recipients list from the step */
    recipientsPromise=getRecipientsList(flowID,targetStepIndex)
    recipientsPromise.then((querySnapshot)=>{

        //console.log(msgObject)
        if(querySnapshot!==0)
        {
          notificationData.notify=querySnapshot.users
          sendEmail(notificationData)
        }
        return 0

    }).catch((error)=>{console.error(error.message)})


  }
  else
  {
    
    sendEmail(notificationData)
  }
  

  return 0
  
  });


async function getRecipientsList(flowID, stepIndex)
{

  stepData=await db.collection("Workflows")
             .doc(flowID)
             .collection("steps")
             .where("index", "==", stepIndex)
             .limit(1)
             .get()
  //console.log("Here 1") 
  documentData=0         
  stepData.forEach((doc)=>{
      //console.log(doc.data())
      //console.log("Here 2")  
      documentData=doc.data()
  })
  //console.log("Here 3")  
  return documentData

}

function sendEmail(notificationData)
{
  msgObject={}
  msgObject.from="rupin@whitehatjr.com"
  actionerName=notificationData.actioner.name
  action = notificationData.action
  emailSubjectPart=""
  if("searchTerms" in notificationData )
  {
    searchTermList=notificationData["searchTerms"]
    noOfTerms=searchTermList.length;
    if(noOfTerms>0)
    {
      subjectTerms=[]
      for(sTermIndex=0;sTermIndex<searchTermList.length;sTermIndex++)
      {
        subjectTerms.push(searchTermList[sTermIndex]["value"])
      }
      emailSubjectPart=subjectTerms.join("-")
      emailSubjectPart="["+emailSubjectPart+"]"
    }

  }
  
  subject=actionerName +" " +action+" the workflow";
  subject=subject+" "+emailSubjectPart
  msgObject.subject=subject
  flowID=notificationData.flowID 
  commentText=notificationData.comment 
  msgObject.to=notificationData.notify
  //console.log(msgObject)
  //return 0

  htmlBody=getHTMLBody(notificationData)
 
  htmlBody.then((htmltemplate)=>{
    htmltemplate=htmltemplate.replace("@actioner", actionerName)
    htmltemplate=htmltemplate.replace("@action", action)
    htmltemplate=htmltemplate.replace("@flowid", flowID)
    if(commentText.length>0)
    {
      htmltemplate=htmltemplate.replace(/@commentdisplayflag/g, "block")
      htmltemplate=htmltemplate.replace("@comment", commentText)
    }
    else
    {
      htmltemplate=htmltemplate.replace(/@commentdisplayflag/g, "none")
    }
    msgObject.html=htmltemplate
    //console.log(htmltemplate)
    //console.log(msgObject)
    sgMail.send(msgObject).then(() => {
      console.log('Email sent')
      return 0
  }).catch((error) => {
    console.error(error)
  })

  return 0


  }).catch((error)=>(console.error(error.message)))
  




  
  
}

async function getHTMLBody(notificationData)
{
  

    const bucket = storageObj.bucket();
    let fileName="email.html"
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const filePath="email-templates/email.html"
    await bucket.file(filePath).download({destination: tempFilePath});
    var data="";
    try {
      data = fs.readFileSync(tempFilePath, 'utf8');
      //console.log("data:"+data);    
    } 
    catch(e) 
    {
        //console.log("Error")
        console.error('Error:', e.stack);
    }

    return data

      


}

