var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

function getLoggedInUserObject()
{
		user=firebase.auth().currentUser
        //console.log(user.uid)
        userData={}
        userData["uid"]=user.uid
        userData["email"]=user.email
        userData["name"]=user.displayName
        return userData;
}


