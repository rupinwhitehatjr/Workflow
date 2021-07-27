import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


#flowList = db.collection(u'Workflows').where("flowType","==", "CurriculumWorkflow").stream()




# flowUpdate={}
# flowUpdate["fields"]=[]
# flowUpdate["onlyreview"]=True

# for flow in flowList:
# 	flowID=flow.id

# 	try:
# 		a=db.collection(u'Workflows').document(flowID).collection("steps").document(u"nVkmBTdGyJ9Nj2JMHtU1").update(flowUpdate)
# 		a=db.collection(u'Workflows').document(flowID).collection("steps").document(u"aJTafcjliU1gHNXQSzig").update(flowUpdate)
# 		a=db.collection(u'Workflows').document(flowID).collection("steps").document(u"CdtUjGKu4OwpBTLvUecJ").update(flowUpdate)
# 		print(doc)
# 	except Exception as e:
# 		print(e)
# 		continue	



flowList = db.collection(u'Workflows').stream()

for flow in flowList:
	flowID=flow.id
	flowObj={}
	flowObj["flowID"]=flowID
	try:
		a=db.collection(u'Workflows').document(flowID).update(flowObj)
		
		print(flowID)
	except Exception as e:
		print(e)
		continue	


