const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


let db = admin.firestore();

exports.copyLayout = functions.firestore
  .document('Workflows/{flowID}')
  .onCreate((snapshot, context) => { 
  	flowID=context.params.flowID
  	flowType=snapshot.data().flowType
  	//console.log(snapshot)
  	//let db=admin.firestore()
  	//console.log(flowType)
  	makeCopy(flowType,flowID)
  	return 0
  	
  });

  async function makeCopy(workflowType, flowID)
  {
  	//console.log(flowType)
	const steps = await db.collection(workflowType).orderBy("index").get()
    
    steps.forEach( (doc)=> {
    	//console.log(doc.id)
    	structure={}
    	structure[doc.id]=doc.data()
        db.collection("Workflows").doc(flowID).update(structure);
    })
    return 0
  }

