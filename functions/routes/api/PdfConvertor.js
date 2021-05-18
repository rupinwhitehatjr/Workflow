/* ---------------------------------------
-------Export Pdf With watermark----------
 */

const admin = require('firebase-admin');

let db = admin.firestore();

const { google } = require('googleapis')

const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

const bucket = storage.bucket('renamingfilesforquiz.appspot.com');

const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')

const fetch = require('node-fetch');

// App Import
const oAuthGoogle = require('../../oAuthGoogle').oAuthGoogle;
const pdfCreate = require('./pdfCreate').pdfCreate;

// Firestore url
const imageUrl = `https://firebasestorage.googleapis.com/v0/b/renamingfilesforquiz.appspot.com/o/watermark-logo%2Fwhitehatjr-logo-file-removebg-preview%20(1).png?alt=media&token=ad0bffe0-4ac5-456f-bd2a-f6799ed1b55c`

// Get Auth
async function getAuth(done) {
  oAuthGoogle('drive', function (err, data) {
    if (!err) {
      done(data)
    }
    else {
      done(err)
    }
  })
}

// Access Token
function tokenGenerate() {
  var token = `${+new Date + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)}`
  token = token.split('').sort(function () { return 0.5 - Math.random() }).join('');
  return token
}

// Extract file Id from google doc url
function getIdFrom(url) {
  try {
      var id;
      var parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
      if (url.indexOf('?id=') >= 0) {
          id = (parts[6].split("=")[1]).replace("&usp", "");
          return {
            success: true,
            message: 'File id',
            data: id
        };
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

async function saveBucket(path, buffer, contentType, token) {
  try {
    await bucket.file(path)
      .save(buffer, {
        gzip: true,
        contentType: contentType,
      })

    const dest = bucket.file(path);

    // Set Metadata
    await dest.setMetadata({
      metadata: {
        // Update the download token:
        firebaseStorageDownloadTokens: token,
      },
    })

    return {
      success: true,
      message: 'File Generated',
      data: `https://firebasestorage.googleapis.com/v0/b/${`renamingfilesforquiz.appspot.com`}/o/${encodeURIComponent(
        path
      )}?alt=media&token=${token}`
    }
  } catch (err) {
    console.log(JSON.stringify(err))
    return {
      success: false,
      message: err.message
    }
  }
}

async function PdfConvertor(req, res) {
  try {

    const { docUrl, watermarkUrl, flowId, userData } = req.body
    if (docUrl && watermarkUrl) {
      getAuth(function (auth) {
        const drive = google.drive({
          version: 'v3',
          auth: auth
        })
        let fileIdUrl = getIdFrom(docUrl)
        if (fileIdUrl.success) {
          console.log(fileIdUrl.data)
          const fileId = fileIdUrl.data
          console.log(fileId)

          var buffers = []
          // Export mime type
          drive.files.export({
            fileId: fileId,
            mimeType: 'application/pdf'
          }, {
            responseType: 'stream'
          }, async function (err, response) {

            if (err) return console.log(err);

            response.data.on('error', err => {
            })
              .on('data', function (data) {
                buffers.push(data);
              })
              .on('end', async () => {

                var buffer = Buffer.concat(buffers);
                const pdfDoc = await PDFDocument.load(buffer)
                const imgFilePng = await fetch(watermarkUrl).then((res) => res.arrayBuffer(res)).catch(err => console.log(err))

                try {
                  const img = await pdfDoc.embedPng(imgFilePng);
                  const preambleDims = img.scale(2)
                  const pages = pdfDoc.getPages()
                  for (let i = 0; i < pages.length; i++) {
                    const { width, height } = img.scale(1);
                    pages[i].drawImage(img, {
                      x: pages[i].getWidth() / 3 - width / 4,
                      y: pages[i].getHeight() / 3 - height / 4,
                      width: preambleDims.width,
                      height: preambleDims.height,
                      opacity: 0.3,
                      rotate: degrees(45),
                    });
                  }

                  var token = tokenGenerate()

                  // Create Metadata
                  await db.collection('Workflows').doc(flowId).get().then(async (res) => {
                    if (res.exists) {
                      let metadata = {
                        "workflowDetails": {
                          "Asset Type": res.data()['Asset Type'],
                          "Class": res.data()['Class'],
                          "Curriculum": res.data()['Curriculum'],
                          "Version": res.data()['Version'],
                          "step_owners": res.data()['step_owners'][0],
                          "searchTerms": res.data()['searchTerms'],
                          "flowType": res.data()['flowType'],
                        },

                        "workflowCreatedBy": {
                          "name": res.data()['name'],
                          "email": res.data()['email'],
                          "photoURL": res.data()['photoURL']
                        },

                        "downloadedPdfBy": {
                          ...userData
                        }
                      }

                      const pdfInfomation = await PDFDocument.create()
                      const timesRomanFont = await pdfInfomation.embedFont(StandardFonts.TimesRoman)
                      const pageCreate = pdfInfomation.addPage()
                      const { width, height } = pageCreate.getSize()
                      pageCreate.drawText('Generated Pdf Information', {
                        x: 50,
                        y: height - 4 * 30,
                        size: 30,
                        font: timesRomanFont,
                        color: rgb(0, 0.53, 0.71),
                      })

                      let pdfCreateData = pdfCreate(metadata)

                      for(let pdfCreateItem of pdfCreateData) {
                        pageCreate.drawText(pdfCreateItem.content, {
                          x: pdfCreateItem.x,
                          y: height - 4 * (pdfCreateItem.y),
                          size: pdfCreateItem.size,
                          font: timesRomanFont,
                          color: rgb(0, 0.53, 0.71),
                        })
                      }

                      // Save pdf metadata
                      var saveInformation = await saveBucket(`Files/pdfMetadata/${fileId}${+new Date()}.pdf`, await pdfInfomation.save(), 'application/pdf', `${token}pdfMetadata`)

                      // Buffer Metadata
                      var bufferJson = new Buffer.from(JSON.stringify(metadata))

                      // Save Json
                      var saveJson = await saveBucket(`Files/JsonMetadata/${fileId}${+new Date()}.json`, bufferJson, 'application/json', `${token}metadata`)
                      if (saveJson && saveJson.success && saveInformation && saveInformation.success) {
                        pdfDoc.setTitle(saveInformation.data)
                        pdfDoc.setSubject(saveJson.data)
                        pdfDoc.setCreationDate(new Date())
                        pdfDoc.setModificationDate(new Date())
                      }
                      else {
                        res.status(500).send({
                          success: false,
                          message: saveJson.message
                        })
                      }
                    }
                  })

                  drive.files.get({
                    fileId: fileId,
                    fields: '*'
                }).then(async function(success){
                  // Save PDF
                  let savePdf = await saveBucket(`Files/${success.data.name}.pdf`, await pdfDoc.save(), 'application/pdf', token)

                  if (savePdf && savePdf.success) {
                    res.status(200).send({
                      success: true,
                      message: savePdf.message,
                      data: savePdf.data
                    })
                  }
                  else {
                    res.status(500).send({
                      success: false,
                      message: savePdf.message
                    })
                  }
                }, function(fail){
                    console.log(fail);
                    console.log('Error '+ fail.result.error.message);
                })                  
                } catch (err) {
                  res.status(500).send({
                    success: false,
                    message: err.message
                  })
                }

              })
          });
        }
        else {
          res.status(500).send({
            success: false,
            message: 'File Id Not Vaild'
          })
        }
      })
    }
    else {
      res.status(500).send({
        success: false,
        message: 'Please enter valid docUrl or watermark url'
      })
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}


module.exports = {
  PdfConvertor: PdfConvertor
}
