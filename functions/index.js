const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


let db = admin.firestore();

exports.copyLayout = functions.firestore
  .document('Workflows/{flowID}')
  .onCreate((snapshot, context) => { 
  	flowID=context.params.flowID
  	userName=snapshot.data().name
  	flowType=snapshot.data().flowType
  	//console.log(snapshot)
  	//let db=admin.firestore()
  	//console.log(flowType)
  	//createDefaultCollection(flowID)
  	makeCopy(flowType,flowID)
  	addLogOnCreate(flowID,userName)
    //updateReadyFlag(flowID)  	
  	//updateFlowOwner()
  	//addLog()
  	//console.log(context.auth.uid)
  	return 0
  	
  });


exports.processSubmission = functions.firestore
  .document('Workflows/{flowID}/steps/{stepId}')
  .onUpdate((change, context) => {

    
    const newValue = change.after.data();
    flowID=context.params.flowID
    stepId=context.params.stepId
    //console.log(stepId)

    if(newValue.action===null)
    {
      //console.log("Retriggered")
      return 0;
    }

    
    action=newValue.action
    nextStepIndex=newValue.nextStep
    previousStepIndex=newValue.previousStep

    actionedby=newValue.by
    //console.log(user.name)
    //return 0;
    user_name=actionedby.name
    stepName=newValue.name
    //remove the action attribute

    //console.log(action)
    if(action==="approved")
    {
      
      addLogOnApprove(flowID,user_name,stepName)
      setNextStepAsActive(flowID,nextStepIndex)
      updatedData={}
      updatedData["activestep"]=false
      updatedData["action"]=null
      updatedData["by"]=null

      db.collection("Workflows")
        .doc(flowID)
        .collection("steps")
        .doc(stepId)
        .update(updatedData)

      // set activestep to false
    }
    
    /*if(action==="rejected")
    {

    }*/

    //console.log(newValue.by.name)


    
    return 0
    
  });

  async function setNextStepAsActive(flowID,stepIndex)
  {
    //console.log("Setting " + stepIndex+" as active.")
    step=await db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .where("index", "==", stepIndex)
                .limit(1)
                .get()
    step.forEach((doc)=> {
              nextStepData={}
              nextStepData["visible"]=true
              nextStepData["activestep"]=true
              nextStepData["action"]=null
              db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .doc(doc.id)
                .update(nextStepData)

    })


    return 0
                
  }





  async function updateReadyFlag(flowID)
  {
    flowDocument=db.collection("Workflows").doc(flowID).update({"ready":true})
    return 0;
  }

  async function addLogOnCreate(flowID, userName)
  {
  	
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Created"
    //console.log(log)
    flowDocument.collection("log").doc().set(log)

    
    
  }

  async function addLogOnApprove(flowID, userName, stepName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Approved"
    log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)

    
    
  }

 

 
  async function makeCopy(workflowType, flowID)
  {
  	//console.log(flowType)
	  const steps = await db.collection(workflowType).orderBy("index").get()
    //flowDocument=db.collection("Workflows").doc(flowID)
    steps.forEach( (doc)=> {
    	 	
        flowDocument.collection("steps").doc(doc.id).set(doc.data())

    })


    return 0
  }

