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
  	//updateFlowOwner()
  	//addLog()
  	//console.log(context.auth.uid)
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
	console.log(log)
	flowDocument.collection("log").doc().set(log)

    
    
  }

 
  async function makeCopy(workflowType, flowID)
  {
  	//console.log(flowType)
	const steps = await db.collection(workflowType).orderBy("index").get()
    flowDocument=db.collection("Workflows").doc(flowID)
    steps.forEach( (doc)=> {
    	//console.log(doc.id)
    	//structure={}
    	//structure[doc.id]=doc.data()    	
        flowDocument.collection("steps").doc(doc.id).set(doc.data())

    })


    return 0
  }

