const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();

 exports.OwnershipChange = functions
  .region('asia-east2')
  .firestore
  .document('OwnershipChange/{docid}')
  .onCreate((snapshot, context) => {

  	//Add a Log
  	userData=snapshot.data()
    newOwner=userData["newOwner"]
    oldOwner=userData["by"]["name"]
    stepName=userData["stepName"]
    

    flowID=userData["flowID"]
    stepID=userData["stepID"]
  	//Update Ownership  in List
  	addLog(flowID, oldOwner, newOwner, stepName)
  	updateOwnership(flowID, stepID, newOwner)

  	return 0

  })

  async function addLog(flowID, oldUser,newUser, stepName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=oldUser
    log.newOwner=newUser
    log.timestamp=Date.now();
    log.action="ownershipchange"
    log.stepName=stepName
    //log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

  async function updateOwnership(flowID, stepID, newUserEmail)
  {
  	creatorName=""
    stepDocumentRef=await db.collection("Workflows")
    					 .doc(flowID)
    					 .collection("steps")
    					 .doc(stepID)
    					 
    stepDocument=stepDocumentRef.get()
    stepDocument.then((snapshot)=>{

      stepData=snapshot.data()
      users=[]
      if("users" in stepData)
      {
      	users=stepData["users"]
      	users[0]=newUserEmail.trim();
      }
      else
      {
      	users.push(newUserEmail)
      }
      stepMeta={}
      stepMeta["rolesSet"]=true
      stepMeta["users"]=users

      stepDocumentRef.update(stepMeta)
      return 0

      

    }).catch((error)=>{console.error(error.message)})
    return 0;

  }
