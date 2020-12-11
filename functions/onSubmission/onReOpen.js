const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.onReOpen = functions
  .region('asia-east2')
  .firestore
  .document('Cache/{cacheID}')
  .onCreate((snapshot, context) => 

  { 
    userData=snapshot.data()
    action=userData["action"]
    if(action!=="reopen")
    {
      return 0
    }

    flowID=userData["flowID"]
   
    user_name=userData["by"]["name"]
   // user_name=userData["by"]["name"]
    

  	addLogOnReOpen(flowID,user_name)

    flowMetaPromise=getFlowMeta(flowID)
      flowMeta=null
      flowMetaPromise.then((doc)=>{
        flowMeta=doc.data()
        return 0
      }).catch((error)=>{console.error(error.message)})

    flowMetaPromise.finally(()=>{  

        let activeStepPromise=setFirstStepAsActive(flowID)

         activeStepPromise.then((snapshot)=>{

          //console.log(snapshot.data())
          stepData=snapshot.data()
          addReOpenNotification(flowID,flowIDuserData,stepData,flowMeta)
          return 0

        }).catch((error)=>{console.error(error.message)})

    }).catch((error)=>{console.error(error.message)})
    


  	
  });



  async function addLogOnReOpen(flowID, userName, stepName)
  {
    
    
    flowDocument=db.collection("Workflows").doc(flowID)  

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Re-Opened"
    //log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

   async function getFlowMeta(flowID)
  {
    
    
    flowDocument=await db.collection("Workflows").doc(flowID).get()


 
    
  }

  

 

   

  
  async function setFirstStepAsActive(flowID,stepIndex)
  {
    //console.log("Setting " + stepIndex+" as active.")
    step=await db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .where("reOpenHere", "==", true)
                .limit(1)
                .get()
    let activestep= null
    step.forEach((doc)=> {
              nextStepData={}
              //nextStepData["visible"]=true
              nextStepData["activestep"]=true
              //nextStepData["action"]=null              
              db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .doc(doc.id)
                .update(nextStepData)
                
              // Once the Active Step has been set, we can update the flow Facade 
              flowMeta={}
              activeStepData=doc.data()
              flowMeta["active_step_name"]=activeStepData.name
              flowMeta["active_step_id"]=doc.id
              flowMeta["closed"]=false
              flowMeta["ready"]=true
              if("users" in activeStepData)
              {
                flowMeta["step_owners"]=activeStepData.users
              }
              else
              {
                flowMeta["step_owners"]=[]
              }  
              
              db.collection("Workflows").doc(flowID).update(flowMeta)               

              activestep=doc

    })
    
    return activestep
                
  }

  function addReOpenNotification(flowID, userData, stepData, flowMeta)
  {

          notificationObject={}
          actioner={}
          actioner["name"]=userData["by"]["name"]
          actioner["email"]=userData["by"]["email"]
          notificationObject["actioner"]=actioner
          notificationObject["notify"]=stepData["users"]
          notificationObject["action"]="Re-Opened"
          notificationObject["flowID"]=flowID
          notificationObject["targetStepIndex"]=stepData["index"]
          notificationObject["stepName"]=""
          notificationObject["timestamp"]=Date.now();
          notificationObject["retries"]=3
          notificationObject["searchTerms"]=flowMeta["searchTerms"]
          notificationObject["comment"]=""
          //console.log(notificationObject)
          db.collection("NotificationQueue").doc().set(notificationObject);
  }

  



  