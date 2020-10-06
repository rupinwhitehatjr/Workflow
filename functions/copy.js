const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.copyLayout = functions
  .region('asia-east2')
  .firestore
  .document('Workflows/{flowID}')
  .onCreate((snapshot, context) => 

  { 
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

