/* ---------------------------------
Set All Checklist Path Reference On 
Workflow Associated With fieldValues
In Step Asset Creation.
-----------------------------------*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();

exports.setChecklist = functions
    .region('asia-east2')
    .firestore
    .document('Cache/{cacheID}')
    .onCreate(async (snapshot, context) => {
        let userData = snapshot.data()
        action = userData["action"]
        fieldValues = userData["fieldValues"]
        if (action !== "approved") {
            console.log("ACTION TYPE")
            return 0
        }

        let flowID = userData["flowID"]
        let stepID = userData["stepID"]


        await setChecklist(flowID, stepID, fieldValues)
    });

async function setChecklist(flowID, stepID, fieldValues) {
    try {
        // Query
        let workflowSteps = db.collection('Workflows').doc(flowID).collection("steps")
        let stepDetails = await workflowSteps.doc(stepID).get()
        let allSteps = await workflowSteps.get()

        if (stepDetails && stepDetails.data() && stepDetails.data().fields && fieldValues && fieldValues.length > 0) {
            let searchParam = {}
            stepDetails.data().fields.map((item, index) => {
                searchParam[item.label] = {
                    isChecklistTerm: item.isChecklistTerm,
                    value: fieldValues[index]
                }
            });

            if (searchParam && allSteps && !allSteps.empty) {
                // Get every step of workflow
                allSteps.docs.map(async (item) => {
                    var checklist = await checklistQuery(searchParam, item.id)

                    // Update checklist reference
                    if (checklist.success) {
                        let checklistRef = db.collection("Checklist").doc(checklist.data.docs[0].id)
                        await workflowSteps.doc(item.id).update({ checklist: checklistRef })
                    }
                })
            }
        }
    }
    catch (err) {
        console.log("ERROR ----->", err)
    }
}

// Checklist Based On searchParam
async function checklistQuery(searchParam, checklistSearchStepID) {

    try {
        let query = db.collection("Checklist")
        query = query.where("stepID", "==", checklistSearchStepID)

        for (searchParamsItem in searchParam) {
            if (searchParam[searchParamsItem].isChecklistTerm)
                query = query.where(searchParamsItem, "==", searchParam[searchParamsItem].value)
        }

        const responseChecklist = await query.get()
        if (responseChecklist.empty) {
            return {
                sucess: false,
                message: "No data found"
            }
        }

        return {
            success: true,
            data: responseChecklist
        }
    }
    catch (err) {
        console.log("ERROR QUERY ----->", err)
    }
}