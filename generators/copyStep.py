import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

sourceProcessName="CurriculumWorkflow-Brazil"
sourceStepID="fSfvBdp7uhiEGFpdZr2x"


sourceDocs = db.collection(sourceProcessName).stream()


for sourceDoc in sourceDocs:
	sourceDocID=sourceDoc.id
	if(sourceDocID==sourceStepID):
		try:
			a=db.collection(sourceProcessName).document().set(sourceDoc.to_dict())		
			#print(flowID)
		except Exception as e:
			print(e)
			continue	