$(document).ready(function(){
// Initialize Cloud Firestore through Firebase


db.collection("CurriculumWorkflow").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
});


});

function createNewWorkFlow()
{
	
    	doc_ref = db.collection("Workflows").doc()
    	user=firebase.auth().currentUser
    	//console.log(user.uid)
    	creationData={}
    	creationData["flowType"]="CurriculumWorkflow"
    	creationData["uid"]=user.uid
    	creationData["email"]=user.email
    	creationData["name"]=user.displayName
    	
    	newFlowID= db.collection("Workflows").doc(doc_ref.id).set(creationData)
 		return doc_ref.id
	
	//console.log(post)
    
}