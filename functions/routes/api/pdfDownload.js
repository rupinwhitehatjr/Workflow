const admin = require('firebase-admin');
let db = admin.firestore();

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
            const url = `http://docs.google.com/document/d/${filenameId.data}/export?format=pdf`
            res.status(200).send({
                success: true,
                message: 'PDF generated',
                data: {
                    url: url
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

async function logCreate(logDocument) {
    var batch = db.batch
    var collectionLog = db.collection("logs").doc()
    batch.set(collectionLog, logDocument)
    batch = await db.commit()
}

module.exports = {
    pdfDownload: pdfDownload
}
