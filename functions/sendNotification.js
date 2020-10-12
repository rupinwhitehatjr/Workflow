const functions = require('firebase-functions');
const admin = require('firebase-admin');


const sgMail = require('@sendgrid/mail')
/* admin is initialised in index.js*/
let db = admin.firestore();

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
  
  msgObject={}
  targetStepIndex=notificationData.targetStepIndex
  recipients=notificationData.notify
  flowID=notificationData.flowID

  
  msgObject.from="rupin@whitehatjr.com"
  actionerName=notificationData.actioner.name
  action = notificationData.action
  subject=actionerName +" " +action+" a Workflow";
  msgObject.subject=subject
  msgObject.html=actionerName +" " +action+" a Workflow";
  msgObject.text=actionerName +" " +action+" a Workflow";


  if(recipients.length===0)
  {
    /* fetch the recipients list from the step */
    recipientsPromise=getRecipientsList(flowID,targetStepIndex)
    recipientsPromise.then((querySnapshot)=>{

        //console.log(msgObject)
        if(querySnapshot!==0)
        {
          msgObject.to=querySnapshot.users
          sendEmail(msgObject)
        }
        return 0

    }).catch((error)=>{console.log(error.message)})


  }
  else
  {
    msgObject.to=recipients
    sendEmail(msgObject)
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

function sendEmail(messageObject)
{
  sgMail.send(messageObject).then(() => {
    console.log('Email sent')
    return 0
  })
  .catch((error) => {
    console.error(error)
  })

  return 0
  
}

