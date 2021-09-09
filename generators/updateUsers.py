import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

userData={}	
userData["users"]=["dattatraya.more@whitehatjr.com", "adrian.cardoza@whitehatjr.com"]
#userData["users"]=["adrian.cardoza@whitehatjr.com"]


docs=[]
docs.append("X9aOnMX7E8sUlaBUyvzk")
docs.append("xT2izBUjvvEIhctxnGXK")
docs.append("y9a1WaUDarqnGQ55uDhC")
docs.append("6vlIe6UZoiLRCGVLDM3E")
docs.append("9FzwzD1wTmpRlbHYI19M")
docs.append("en1wZChXkKGacbIwprHl")
docs.append("yM3AaynTD1pHuF4Z42iN")
docs.append("ZWip6wjJAq2qWaFhrapj")













for doc in docs:
	try:
		a=db.collection(u'Workflows').document(doc).collection("steps").document(u"O5havGgbQWzLRlpLcN3d").update(userData)
		print(doc)
	except:
		continue	


