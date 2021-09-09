import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
workflowType="CurriculumWorkFlow1to2"




f = open(workflowType+".txt", "a")



workflowList=db.collection("Workflows").where("flowType","==", workflowType).stream()


for workflow in workflowList:

	docID=workflow.id
	print(docID)
	#get logs

	logDocs=db.collection("Workflows").document(docID).collection("log").order_by("timestamp").stream()

	for logDoc in logDocs:
		logs=logDoc.to_dict()
		f.write(docID+",")
		f.write(workflowType+",")

		if("action" in logs):
			f.write(str(logs["action"])+",")
		else:
			f.write(",")

		

		if("creatorName" in logs):
			f.write(str(logs["creatorName"])+",")
		else:
			f.write(",")

		
		if("stepName" in logs):
			f.write(str(logs["stepName"])+",")
		else:
			f.write("Creation,")



		ts=logs["timestamp"]
		dt=datetime.fromtimestamp(int(ts/1000))
		date=f"{dt:%d-%m-%y}"
		f.write(date)
		


		f.write("\n")

f.close()
	
	