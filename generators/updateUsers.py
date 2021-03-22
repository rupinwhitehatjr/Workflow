import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()




#steps = db.collection(u'CurriculumWorkflow').order_by(u'position').stream()

userData={}	
userData["users"]=["bhavesh.bangera@whitehatjr.com"]

docs=[]
# docs.append("tQ1nJE5SUlw8UZWr6CsV")
# docs.append("g9MBmNIMbk1Hj2OeoMxp")
# docs.append("zaolWYMR3uPHShv24MQc")
# docs.append("uctRvFiDT1gd6Vmf7w4t")
# docs.append("Z1UOvKKyesKGVEhO23oh")
# docs.append("qZnBqaeQOGwNkzMRnez1")
# docs.append("3YKiOg5NbBJBkiJAW2e7")
# docs.append("2TYojJbKPUJbUxJyVxib")
# docs.append("FNhtVrqyIeF99NmD4NNP")
# docs.append("twNF4f9aARx1M8bZPZRc")
# docs.append("qLGBmMjlMhXzFdsQtK9y")
# docs.append("KYgpuJUIZ9cKmSW2xOFz")
# docs.append("y6FHXCWuAtMBdR1rVM8z")
# docs.append("tBdCYn5OBlu5VoEVOuBa")
# docs.append("ZNC5jnPLXbjZPK7bKzPK")
# docs.append("wiDLyWCno5RXkJjp3Ltl")
# docs.append("DI4hPzYXFdXCeaJraO3l")
# docs.append("R5ZefLcQD0SjWrY5p7jp")
# docs.append("piM0QpRywm4QyuMCfFj8")


docs.append("fEO8plawiWnNskFq7Vb3")











for doc in docs:
	try:
		a=db.collection(u'Workflows').document(doc).collection("steps").document(u"O5havGgbQWzLRlpLcN3d").update(userData)
		print(doc)
	except:
		continue	


