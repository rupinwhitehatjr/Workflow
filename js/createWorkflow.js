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
    	newFlowID= db.collection("Workflows").doc(doc_ref.id).set({"flowType":"CurriculumWorkflow"})
 		return doc_ref.id
	
	//console.log(post)
    
}