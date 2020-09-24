$(document).ready(function(){
// Initialize Cloud Firestore through Firebase


/*db.collection("CurriculumWorkflow").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
});*/


});

function buttonAction(flow_type)
{
       
      // 

}

function createNewWorkFlow(flow_type)
{
	
    	doc_ref = db.collection("Workflows").doc()
        user=firebase.auth().currentUser
        //console.log(user.uid)
        creationData={}
        creationData["flowType"]=flow_type
        creationData["uid"]=user.uid
        creationData["email"]=user.email
        creationData["name"]=user.displayName
        //creationData["ready"]=false
        
        newFlowID=db.collection("Workflows").doc(doc_ref.id).set(creationData)
        newFlowID.then(snapshot=>{
            
            //console.log(doc_ref.id)
            URL="viewFlow.html?id="+doc_ref.id
            window.location.replace(URL);
           

        })
        //return doc_ref.id
	
	
    
}