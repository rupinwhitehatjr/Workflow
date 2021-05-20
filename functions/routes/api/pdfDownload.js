const admin = require('firebase-admin');
let db = admin.firestore();
const { google } = require('googleapis')
const oAuthGoogle = require('../../oAuthGoogle').oAuthGoogle

async function pdfDownload(req, res) {
    try {
        let logDocument = {};
        logDocument.triggerPoint = 'pdfDownload'
        const { docUrl, downloadedByDetails } = req.body
        logDocument.params = docUrl
        const filenameId = getIdFrom(docUrl)
        logDocument.email = downloadedByDetails.email
        logDocument.uid = downloadedByDetails.uid
        if (filenameId && filenameId.success) {

            // oAuthGogle auth token
            oAuthGoogle('drive', async function (auth) {
                if (auth) {
                    const response = await getFile(auth, filenameId.data)
                    if(response && response.data && response.success && response.data && response.data.url) {
                        res.status(200).send({
                            success: true,
                            message: 'PDF generated',
                            data: {
                                url: response.data.url
                            }
                        })
                    }
                    else {
                        res.status(500).send(response)
                    }
                }
            })
        }
        else {
            logDocument.error = filenameId.message
            await logCreate(logDocument)
            res.status(500).send({
                success: false,
                message: filenameId.message,
            })
        }
    } catch (error) {
        logDocument.error = error.message
        await logCreate(logDocument)
        res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}


// Extract file Id from google doc url
function getIdFrom(url) {
    try {
        var id;
        var parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
        if (url.indexOf('?id=') >= 0) {
            id = (parts[6].split("=")[1]).replace("&usp", "");
            return id;
        } else {
            id = parts[5].split("/");
            var sortArr = id.sort(function (a, b) { return b.length - a.length });
            id = sortArr[0];
            return {
                success: true,
                message: 'File id',
                data: id
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

// Access from g-drive
async function getFile(auth, fileId) {
    try {
        const drive = google.drive({ version: 'v3', auth });
        const responseFiles = await drive.files.get({ fileId: fileId, fields: '*' });
        if (responseFiles && responseFiles.data && responseFiles.data.exportLinks && responseFiles.data.exportLinks['application/pdf']) {
            return {
                success: true,
                message: 'PDF Url',
                data: {
                    url: responseFiles.data.exportLinks['application/pdf']
                }
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: error.message,
        }
    }
}


async function logCreate(logDocument) {
    var batch = db.batch
    var collectionLog = db.collection("logs").doc()
    batch.set(collectionLog, logDocument)
    batch = await db.commit()
}

module.exports = {
    pdfDownload: pdfDownload
}
