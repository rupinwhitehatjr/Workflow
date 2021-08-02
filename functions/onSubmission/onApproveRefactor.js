const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();

exports.onApprove = functions
  .region('asia-east2')
  .firestore
  .document('Cache/{cacheID}')
  .onCreate(async (snapshot, context) => {
    try {
      let userData = snapshot.data()
      console.log("SNAPDATA ------->", JSON.stringify(userData))

      let action = userData["action"]
      console.log("ACTION ------>", action)

      if (action !== "approved") {
        return 0
      }

      let flowID = userData["flowID"]
      let stepID = userData["stepID"]
      let user_name = userData["by"]["name"]
      // let fieldValues = userData["fieldValues"]

      let stepInfoPromise = await getStepInfo(flowID, stepID)
      console.log("STEP INFO PROMISE ------->", stepInfoPromise)

      let stepStructure = stepInfoPromise.data()

      let stepName = stepStructure["name"]
      let nextStepIndex = stepStructure["nextStep"]
      await addLogOnApprove(flowID, user_name, stepName)
      await updateCurrentstep(flowID, stepID, userData)

      // If there is no next step, the workflow is closed
      if (nextStepIndex === null) {
        console.log("Flow is completed")
        //mark the flow as completed
        await addLogOnClose(flowID, user_name, stepName)
        await setWorkflowAsClosed(flowID)
        return 0
      }
      else {

        let activeStepPromise = await setStepAsActive(flowID, nextStepIndex)

      }

    } catch (err) {
      console.log("ERROR ----->", err)
    }

  });

async function getStepInfo(flowID, stepID) {

  try {
    let stepInfoPromise = await db.collection("Workflows")
      .doc(flowID)
      .collection("steps")
      .doc(stepID)
      .get()

    return stepInfoPromise
  } catch (err) {
    console.log("ERROR STEP INFO ----->", err)
  }

}

async function addLogOnApprove(flowID, userName, stepName) {
  try {
    let flowDocument = db.collection("Workflows").doc(flowID)

    let log = {}
    log.creatorName = userName
    log.timestamp = Date.now();
    log.action = "Approved"
    log.stepName = stepName
    //console.log(log)
    await flowDocument.collection("log").doc().set(log)
  } catch (err) {
    console.log("ERROR ADD LOG ON APPROVE ------>", err)
  }

}

async function addLogOnClose(flowID, userName) {

  try {
    // let creatorName = ""
    let flowDocument = db.collection("Workflows").doc(flowID)

    let log = {}
    log.creatorName = userName
    // Just add a little delay to ensure the closed happens after everything else. 
    log.timestamp = Date.now() + 10;
    log.action = "Closed"
    //log.stepName=stepName
    //console.log(log)
    await flowDocument.collection("log").doc().set(log)
  } catch (err) {
    console.log("ERROR ADD LOG ON CLOSE ------>", err)
  }

}

async function setWorkflowAsClosed(flowID) {
  try {
    let flowMeta = {}
    flowMeta["ready"] = true
    flowMeta["closed"] = true
    flowMeta["active_step_name"] = null
    flowMeta["active_step_id"] = null
    //console.log(flowMeta)
    await db.collection("Workflows")
      .doc(flowID)
      .update(flowMeta)
  } catch (err) {
    console.log("ERROR WORKFLOW CLOSED ---->", err)
  }
}




async function setStepAsActive(flowID, stepIndex) {
  try {
    //console.log("Setting " + stepIndex+" as active.")
    let step = await db.collection("Workflows")
      .doc(flowID)
      .collection("steps")
      .where("index", "==", stepIndex)
      .limit(1)
      .get()
    let activestep = null
    if(step && !step.empty) {
      step.docs.forEach(async (doc) => {
        let nextStepData = {}
        nextStepData["visible"] = true
        nextStepData["activestep"] = true
        //nextStepData["action"]=null              
        await db.collection("Workflows")
          .doc(flowID)
          .collection("steps")
          .doc(doc.id)
          .update(nextStepData)
  
        // Once the Active Step has been set, we can update the flow Facade 
        let flowMeta = {}
        let activeStepData = doc.data()
        flowMeta["active_step_name"] = activeStepData.name
        flowMeta["active_step_id"] = doc.id
        if ("users" in activeStepData) {
          flowMeta["step_owners"] = activeStepData.users
        }
        else {
          flowMeta["step_owners"] = []
        }
  
        await db.collection("Workflows").doc(flowID).update(flowMeta)
  
  
  
        activestep = doc
  
      })
  
  
      return activestep
    }
  } catch (err) {
    console.log("ERROR ACTIVE STEP ------->", err)
  }

}

async function updateCurrentstep(flowID, stepID, newValue) {
  try {
    let updatedData = {}
    updatedData["activestep"] = false
    updatedData["action"] = null
    if ("fieldValues" in newValue) {
      updatedData["fieldValues"] = newValue.fieldValues
    }

    let actionerEmail = newValue.by.email
    updatedData["users"] = admin.firestore
      .FieldValue
      .arrayUnion(actionerEmail)
    /*updatedData["by"]=null*/


    let stepUpdate = await db.collection("Workflows")
      .doc(flowID)
      .collection("steps")
      .doc(stepID)
      .update(updatedData)

    return stepUpdate
  } catch (err) {
    console.log("ERROR CURRENT STEP ------>", err)
  }
}