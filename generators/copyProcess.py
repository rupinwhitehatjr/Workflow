import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

sourceProcessName="CurriculumWorkFlow1to2"
targetProcessName="SchoolCurriculum"

sourceDocs = db.collection(sourceProcessName).stream()


for sourceDoc in sourceDocs:
	
	try:
		a=db.collection(targetProcessName).document().set(sourceDoc.to_dict())		
		#print(flowID)
	except Exception as e:
		print(e)
		continue	