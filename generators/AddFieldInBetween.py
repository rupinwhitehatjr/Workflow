import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


processName="SchoolCurriculum"
targetStepID="RvTCRKtnnN8HSkgwotkO"
insertAt=3
copyField=2

newList=[]
sourceDocs = db.collection(processName).stream()


for sourceDoc in sourceDocs:

	docID=sourceDoc.id
	if(docID==targetStepID):
		documentData=sourceDoc.to_dict()
		fields=documentData["fields"]
		fieldCopy=fields[copyField]
		fields.insert(3, fieldCopy)
		
		db.collection(processName).document(targetStepID).update({"fields":fields})

		
		break;
	
	