/* ---------------------------------------
-------Export Pdf With watermark----------
 */

const { google } = require('googleapis')

const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

const bucket = storage.bucket('renamingfilesforquiz.appspot.com');

const { degrees, PDFDocument } = require('pdf-lib')

const fetch = require('node-fetch');

// App Import
const oAuthGoogle = require('../../oAuthGoogle').oAuthGoogle;

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

async function PdfConvertor(req, res) {
  try {

    const { docUrl } = req.body

    if(docUrl) {
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
        }, function (err, response) {

          if (err) return console.log(err);

          response.data.on('error', err => {
          })
            .on('data', async function (data) {
              buffers.push(data);
            })
            .on('end', async () => {

              var buffer = Buffer.concat(buffers);
              const pdfDoc = await PDFDocument.load(buffer)
              const imgFilePng = await fetch(imageUrl).then((res) => res.arrayBuffer(res))

              try {
                const img = await pdfDoc.embedPng(imgFilePng);
                const pages = pdfDoc.getPages()
                for (let i = 0; i < pages.length; i++) {
                  const { width, height } = img.scale(1);
                  pages[i].drawImage(img, {
                    x: pages[i].getWidth() / 2 - width / 2,
                    y: pages[i].getHeight() / 2 - height / 2,
                    opacity: 0.5,
                    rotate: degrees(45),
                  });
                }
                var token = tokenGenerate()

                await bucket.file(`Files/${fileId}.pdf`)
                  .save(await pdfDoc.save(), {
                    gzip: true,
                    contentType: 'application/pdf',
                  })

                const pdfUrlGenerate = bucket.file(`Files/${fileId}.pdf`);

                // Set Metadata
                await pdfUrlGenerate.setMetadata({
                  metadata: {
                    // Update the download token:
                    firebaseStorageDownloadTokens: token,
                  },
                })

                res.status(200).send({
                  success: true,
                  message: 'PDF Generated',
                  data: `https://firebasestorage.googleapis.com/v0/b/${`renamingfilesforquiz.appspot.com`}/o/${encodeURIComponent(
                    `Files/${fileId}.pdf`
                  )}?alt=media&token=${token}`
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
        message: 'Please enter valid doc url'
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
