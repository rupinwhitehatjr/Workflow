import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

userData={}	
#userData["users"]=["dattatraya.more@whitehatjr.com"]
userData["users"]=["adrian.cardoza@whitehatjr.com"]


docs=[]
docs.append("VtWRlR58wWicimbu1kmQ")













for doc in docs:
	try:
		a=db.collection(u'Workflows').document(doc).collection("steps").document(u"O5havGgbQWzLRlpLcN3d").update(userData)
		print(doc)
	except:
		continue	


