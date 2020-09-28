import firebase_admin
import mock
from firebase_admin import credentials
from firebase_admin import firestore
import os
from google.cloud import firestore
import google.auth.credentials

# Use a service account
#cred = credentials.Certificate('config.json')
#firebase_admin.initialize_app(cred)

os.environ["FIRESTORE_DATASET"] = "test"
os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8081"
os.environ["FIRESTORE_EMULATOR_HOST_PATH"] = "localhost:8081/firestore"
os.environ["FIRESTORE_HOST"] = "http://localhost:8081"
os.environ["FIRESTORE_PROJECT_ID"] = "test"

credentials = mock.Mock(spec=google.auth.credentials.Credentials)
db = firestore.Client(project="test", credentials=credentials)



#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

step={}	
step["index"]=10
step["activestep"]=True
step["visible"]=True
step["nextStep"]=20
step["previousStep"]=None
fields=[]
levelObj={"label":"Curriculum","mandatory":True, "type":"dropdown", "options":["BEG", "INT", "ADV", "PRO", "APT"]}
versionObject={"label":"Version", "mandatory":True, "type":"dropdown", "options":["V1", "V2"]}
classObject={"label":"Class","mandatory":True, "type":"text"}
documentType={"label":"Asset Type","mandatory":True, "type":"dropdown","options":["Class Document", "Summary"]}
documentURL={"label":"Document URL","mandatory":True, "type":"text"}
systemURL={"label":"System URL","type":"label"}
fields.append(levelObj)
fields.append(versionObject)
fields.append(classObject)
fields.append(documentType)
fields.append(documentURL)
fields.append(systemURL)
step["fields"]=fields
step["name"]="Development and Creation"

db.collection(u'CurriculumWorkflow').document().set(step)


step={}	
step["index"]=20
step["name"]="ID Review"
step["nextStep"]=None
step["previousStep"]=10
step["activestep"]=True
step["visible"]=False
# fields=[]
# levelObj={}
# versionObject={}
# classObject={}
# documentType={}
# documentURL={}
# systemURL={}
# fields.append(levelObj)
# fields.append(versionObject)
# fields.append(classObject)
# fields.append(documentType)
# fields.append(documentURL)
# fields.append(systemURL)
# step["fields"]=fields


db.collection(u'CurriculumWorkflow').document().set(step)
	


# 	#fields=db.collection(u'CurriculumWorkflow').document(stepID).collection(u'Fields')
# 	db.collection(u'Workflows').document().set(data)
# 	#for field in fields.stream():
# 		#print(f'{field.id} => {field.to_dict()}')
	
	
	