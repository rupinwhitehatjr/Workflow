const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


let db = admin.firestore();



exports.copyLayout = functions
  .region('asia-east2')
  .firestore
  .document('Workflows/{flowID}')
  .onCreate((snapshot, context) => { 
  	flowID=context.params.flowID
  	userName=snapshot.data().name
  	flowType=snapshot.data().flowType
  	
  	var copydone=makeCopy(flowType,flowID)
  	var logdone=addLogOnCreate(flowID,userName)
    // Only update the Flow Facade when the copy is done
    copydone.then((querySnapshot)=> {
          //console.log(querySnapshot.data().index)
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=querySnapshot.data().name
              flowMeta["active_step_id"]=querySnapshot.id
              flowMeta["closed"]=false
              updateFlowFacade(flowID, flowMeta)
           
              return 0
            
        }).catch(() => null)
  	
  	return 0
  	
  });


exports.processSubmission = functions
  .region('asia-east2')
  .firestore
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
      if(nextStepIndex!==null)
      {
        let activeStepPromise=setStepAsActive(flowID,nextStepIndex)

        /*the activesteppromise variable holds the
        data for the active step.
        Use the same data to update the flow meta */


        activeStepPromise.then((querySnapshot)=> {
          //console.log(querySnapshot.data().index)
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=querySnapshot.data().name
              flowMeta["active_step_id"]=querySnapshot.id
              flowMeta["closed"]=false
              updateFlowFacade(flowID, flowMeta)
           
              return 0
            
        }).catch(() => null)


      }
      else
      {
        console.log("Flow is completed")
        //mark flow as completed
        let logClose=addLogOnClose(flowID,user_name,stepName)
        logClose.then(()=>{
            setWorkflowAsClosed(flowID)  
            return 0
            
        })  
        .catch(() => null)
      }
      // set activestep to false
      setCurrentStepAsInactive(flowID,stepId)
    }
    
    if(action==="rejected")
    {
      addLogOnReject(flowID,user_name,stepName)

      if(previousStepIndex!==null)
      {
        
        let activeStepPromise=setStepAsActive(flowID,previousStepIndex)

        /*the activesteppromise variable holds the
        data for the active step.
        Use the same data to update the flow meta */

        activeStepPromise.then((querySnapshot)=> {
          //console.log(querySnapshot.data().index)
              flowMeta={}
              flowMeta["ready"]=true
              flowMeta["active_step_name"]=querySnapshot.data().name
              flowMeta["active_step_id"]=querySnapshot.id
              flowMeta["closed"]=false
              updateFlowFacade(flowID, flowMeta)
           
              return 0
            
        }).catch(() => null)
      }
      else
      {
        console.log("You reached the start of the Workflow")
       
      }
      // set activestep to false
      setCurrentStepAsInactive(flowID,stepId)
    }

    //console.log(newValue.by.name)


    
    return 0
    
  });


  function setCurrentStepAsInactive(flowID, stepID)
  {
      updatedData={}
      updatedData["activestep"]=false
      updatedData["action"]=null
      updatedData["by"]=null

      db.collection("Workflows")
        .doc(flowID)
        .collection("steps")
        .doc(stepID)
        .update(updatedData)
  }

  async function setStepAsActive(flowID,stepIndex)
  {
    //console.log("Setting " + stepIndex+" as active.")
    step=await db.collection("Workflows")
                .doc(flowID)
                .collection("steps")
                .where("index", "==", stepIndex)
                .limit(1)
                .get()
    let activestep= null
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

              activestep=doc

    })

    //console.log(activestep)
    return activestep
                
  }





  async function updateFlowFacade(flowID,flowMeta)
  {
    
     db.collection("Workflows").doc(flowID).update(flowMeta)   
   
    return 0;
  }

  async function setWorkflowAsClosed(flowID)
  {
      flowMeta={}
      flowMeta["ready"]=true
      flowMeta["closed"]=true
      flowMeta["active_step_name"]=null
      flowMeta["active_step_id"]=null
      //console.log(flowMeta)
      db.collection("Workflows")
        .doc(flowID)
        .update(flowMeta)
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

   async function addLogOnReject(flowID, userName, stepName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    log.timestamp=Date.now();
    log.action="Rejected"
    log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

  async function addLogOnClose(flowID, userName)
  {
    
    creatorName=""
    flowDocument=db.collection("Workflows").doc(flowID)   

    log={}
    log.creatorName=userName
    // Just add a little delay to ensure the closed happens after everything else. 
    log.timestamp=Date.now()+ 10;
    log.action="Closed"
    //log.stepName=stepName
    //console.log(log)
    flowDocument.collection("log").doc().set(log)    
    
  }

 

 
  async function makeCopy(workflowType, flowID)
  {
  	//console.log(flowType)
	  const steps = await db.collection(workflowType).orderBy("index").get()
    flowDocument=db.collection("Workflows").doc(flowID)
    flowSteps=[]
    let activestep=null
    steps.forEach( (doc)=> {
    	 	//console.log("copying")
        flowDocument.collection("steps").doc(doc.id).set(doc.data())
        flowDetail={}

        flowDetail['name']=doc.data().name
        flowDetail['id']=doc.id
        if(doc.data().activestep)
        {
          activestep=doc
        }
        flowSteps.push(flowDetail)

    })

    flowDocument.update({'allSteps':flowSteps})


    return activestep
  }

