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
userData["users"]=["heeral.tyagi@whitehatjr.com"]


docs=[]
docs.append("eqel00nhTsbivHv83PdO")
docs.append("nBEsHPZg86qBWSZ8GYVg")
docs.append("IWgqA3ryVgyz5rYx4703")
docs.append("QOV15HQ9mbrPhMuiYq50")
docs.append("Hx4IqkEYbxrpRJ9YbIXp")
docs.append("KfPRfh3z8Vn2nbeZBjCR")
docs.append("wwMzOop9QMj7lWvG1bJ6")
docs.append("JkpCfOO5r1xIylmOIrP3")











for doc in docs:
	try:
		a=db.collection(u'Workflows').document(doc).collection("steps").document(u"O5havGgbQWzLRlpLcN3d").update(userData)
		print(doc)
	except:
		continue	


