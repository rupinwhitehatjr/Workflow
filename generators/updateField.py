import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


processName="SchoolCurriculum"
targetStepID="RvTCRKtnnN8HSkgwotkO"
insertAt=4


newList=[]
sourceDocs = db.collection(processName).stream()

fieldData={}
fieldData["isChecklistTerm"]=False
fieldData["isSearchTerm"]=True
fieldData["label"]="Class Number"
fieldData["mandatory"]=True
fieldData["type"]="dropdown"
fieldData["userGroupKey"]=False

optionsArray=list(range(0, 301))
startOptions=["CLB1","CLB2","CLB3","CLB4","C0"]
fieldData["options"]=startOptions+optionsArray




for sourceDoc in sourceDocs:

	docID=sourceDoc.id
	if(docID==targetStepID):
		documentData=sourceDoc.to_dict()
		fields=documentData["fields"]
		fields.insert(insertAt, fieldData)

		print(fields)
		
		db.collection(processName).document(targetStepID).update({"fields":fields})

		
		break;
	
	