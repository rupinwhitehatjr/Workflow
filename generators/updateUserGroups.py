import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


curriculum="APT"

userGroups = db.collection(u'UserGroups').where("Curriculum","==", curriculum).where("Version","==","V1").stream()

for userGroup in userGroups:
	groupID=userGroup.id
	groupData=userGroup.to_dict()

	groupData["Version"]="V2"
	groupData["groupKey"]=curriculum+"-V2"
	db.collection(u'UserGroups').document().set(groupData)	
	groupData["Version"]="V3"
	groupData["groupKey"]=curriculum+"-V3"	
	db.collection(u'UserGroups').document().set(groupData)
	groupData["Version"]="V1 BFS"
	groupData["groupKey"]=curriculum+"-V1 BFS"	
	db.collection(u'UserGroups').document().set(groupData)
	groupData["Version"]="V2 BFS"
	groupData["groupKey"]=curriculum+"-V2 BFS"	
	db.collection(u'UserGroups').document().set(groupData)
	groupData["Version"]="V3 BFS"
	groupData["groupKey"]=curriculum+"-V3 BFS"	
	db.collection(u'UserGroups').document().set(groupData)
	exit()

# for userGroup in userGroups:
# 	groupID=userGroup.id
# 	groupData=userGroup.to_dict()
# 	print(groupData)
# 	if(groupData["Version"]=="V1"):
# 		continue

# 	db.collection(u'UserGroups').document(groupID).delete()
	



