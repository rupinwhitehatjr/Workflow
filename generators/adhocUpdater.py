import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()




#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

creationData={}	
creationData["reopenhere"]=True


docs = db.collection(u'Workflows').where(u'flowType', u'==', u'CurriculumWorkflow').stream()

for doc in docs:
	try:
		a=db.collection(u'Workflows').document(doc.id).collection("steps").document(u"1ODa6DD776hkTOCdUj08").update(creationData)
		print(doc.id)
	except:
		continue	


