const http = require('http');
const admin = require('firebase-admin');
const request = require('request'); 
const { google } = require('googleapis')

const path = require('path')
const fs = require('fs')
const puppeteer = require("puppeteer");

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('renamingfilesforquiz.appspot.com');
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const fetch = require('node-fetch'); 
let onFileName = +new Date

// async function getFile(auth, fileId) {
//   try {
//     const file = bucket.file(`Files/sample${onFileName}.pdf`);
//     var url = `http://docs.google.com/document/d/${fileId}/export?format=pdf`
//     http.get(url, async function (response) {
//       response.pipe(file.createWriteStream({ contentType: 'auto' }))
//         .on('error', async function (err) {
//           console.log(err)
//         })
//         .on('finish', async function () {
//           console.log("Complete.");
//           modifyPdf(url)
//           return url 
//         });
//     });
//   }
//   catch (error) {
//     console.log(error)
//     return error.message
//   }
// }

// async function getHtml(url) {
//   try {
//     const file = bucket.file(`Files/sample${onFileName}.html`);
//     // const file = fs.createWriteStream(`./sample${onFileName}.html`);
//     const request = http.get(url, async function (response) {
//     response.pipe(file.createWriteStream({contentType: 'auto'}))
//     .on('error', async function(err) {
//       console.log(err)
//     })
//     .on('finish', async function() {
//       console.log("Complete.");
//       var pdfFile = await createPdf()
//       return pdfFile
//     });
//     });
//   } catch (error) {
//     console.log(error)
//   }
// }

async function createPdf() {
  try {
    const htmlFiles = path.resolve(`./sample${onFileName}.html`);
    // const htmlFiles = path.resolve(`./sample.html`);
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.goto("file://" + htmlFiles);
    // await page.setContent(htmlContent)
    await page.evaluate(() => {
      const img = document.createElement('img');
      img.src = './image-logo.jpeg'
      img.style.cssText = "position: fixed; margin-left: 0%; margin-bottom: 60%; width: 75%; bottom: 10px; opacity: 0.3; transform: rotate(300deg); z-index: 1";
      document.body.appendChild(img);
    });
    await page.pdf({ path: `./sample${onFileName}.pdf`, format: "Letter" });
    await browser.close()
    return `./sample${onFileName}.pdf`
  } catch (error) {
    console.log(error)
  }
}


// async function generatePublicUrl(auth, docFileId) {
//   try {
//     const fileId = docFileId;
//     await drive.permissions.create({
//       fileId: fileId,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//     });
//     const result = await drive.files.get({
//       fileId: fileId,
//       fields: 'webViewLink, webContentLink',
//     });
//     if (result && result.data && result.data.webViewLink) {
//       console.log(result.data)
//       var pdfFileUrl = await getFile(auth, docFileId)
//       return pdfFileUrl

//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     })
//   }
// }
async function PdfConvertor(req, res) {
  try {
    const { filenameId } = req.body
    const urlPDF = `http://docs.google.com/document/d/${filenameId}/export?format=pdf`
    const pdfDoc = await fetch(urlPDF).then(res => res.arrayBuffer())
    const imgUrl = `https://firebasestorage.googleapis.com/v0/b/renamingfilesforquiz.appspot.com/o/watermark-logo%2Fwhithatjr-logo.png?alt=media&token=32f62350-ac5c-49eb-aed6-09527be3e7d0`
    const imgEncoded = await fetch(imgUrl).then(res => res.arrayBuffer())
    const img = await pdfDoc.embedPng(imgEncoded);
  
    const pages = pdfDoc.getPages()
    for(let i = 0; i < pages.length; i++) {
      // Draw the image on the center of the page
      const { width, height } = img.scale(1);
      pages[i].drawImage(img, {
        x: pages[i].getWidth() / 2 - width / 2,
        y: pages[i].getHeight() / 2 - height / 2,
        opacity: 0.3,
        rotate: degrees(45),
      });
  
    const pdfBytes = await pdfDoc.save()
    // Write the PDF to a file
  }
  } catch (error) {
    res.send(error)
    console.log('ERROR ON 172 ------>', error.message)
    return error.message
  }
}

async function modifyPdf(url) {
request(url, async function(err, response, body){ 
  if (response) {
    const pdfDoc = body
    const img = await pdfDoc.embedPng(fs.readFileSync('./image-logo.png'));
    const pages = pdfDoc.getPages()
    for (let i = 0; i < pages.length; i++) {
      // Draw the image on the center of the page
      const { width, height } = img.scale(1);
      pages[i].drawImage(img, {
        x: pages[i].getWidth() / 2 - width / 2,
        y: pages[i].getHeight() / 2 - height / 2,
        opacity: 0.3,
        rotate: degrees(45),
      });
      const pdfBytes = await pdfDoc.save()
    }
  }
  else {
    console.log(err)
  }
});
}

async function uploadPdf(localFile, remoteFile) {
  var token = +new Date
  bucket.upload(localFile, {
    destination: remoteFile,
    uploadType: "media",
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  })
  .then((data) => {

      let file = data[0];

      return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid);
  });

}


module.exports = {
  PdfConvertor: PdfConvertor
}




// const keyFilename="./xxxxx.json"; //replace this with api key file
//     const projectId = "xxxx" //replace with your project id
//     const bucketName = "xx.xx.appspot.com"; //Add your bucket name
//     var mime=require('mime-types');
//     const { Storage } = require('@google-cloud/storage');
//     const uuidv1 = require('uuid/v1');//this for unique id generation

//    const gcs = new Storage({
//     projectId: projectId,
//     keyFilename: './xxxx.json'
//      });
//     const bucket = gcs.bucket(bucketName);

//     const filePath = "./sample.odp";
//     const remotePath = "/test/sample.odp";
//     const fileMime = mime.lookup(filePath);

// //we need to pass those parameters for this function
//     var upload = (filePath, remoteFile, fileMime) => {

//       let uuid = uuidv1();

//       return bucket.upload(filePath, {
//             destination: remoteFile,
//             uploadType: "media",
//             metadata: {
//               contentType: fileMime,
//               metadata: {
//                 firebaseStorageDownloadTokens: uuid
//               }
//             }
//           })
//           .then((data) => {

//               let file = data[0];

//               return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid);
//           });
//     }
// //This function is for generation download url    
//  upload(filePath, remotePath, fileMime).then( downloadURL => {
//         console.log(downloadURL);

//       });

function downloadViaUrl() {
  const storageRef = firebase.storage().ref();

  // [START storage_download_via_url]
  storageRef.child('images/stars.jpg').getDownloadURL()
    .then((url) => {
      // `url` is the download URL for 'images/stars.jpg'
    
      // This can be downloaded directly:
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        var blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
    
      // Or inserted into an <img> element
      var img = document.getElementById('myimg');
      img.setAttribute('src', url);
    })
    .catch((error) => {
      // Handle any errors
    });
  // [END storage_download_via_url]
}
// const getUrl = await modifyPdf(`http://docs.google.com/document/d/${filenameId}/export?format=pdf`)
// request(`http://docs.google.com/document/d/${filenameId}/export?format=pdf`, async function(err, response, body){ 
//   if (response) {
//     var encodedBody = Buffer.from(body, 'base64')
//     const pdfDoc = encodedBody
//     console.log(JSON.stringify(pdfDoc))
//     var imageUrl = `https://firebasestorage.googleapis.com/v0/b/renamingfilesforquiz.appspot.com/o/watermark-logo%2Fwhithatjr-logo.png?alt=media&token=32f62350-ac5c-49eb-aed6-09527be3e7d0`
//     request(imageUrl, async function(err, response, body) {
//       console.log(JSON.stringify(response))
//       if(response) {
//         try {
//           const imgFile = body
//           console.log(JSON.stringify(imgFile))
//           // var encodedImage = new Buffer(imgFile, 'binary').toString('base64');
//           var encodedImage = Buffer.from(imgFile, 'base64')
//           console.log(JSON.stringify(encodedImage))
//           const img = await pdfDoc.embedPng(encodedImage);
//           const pages = pdfDoc.getPages()
//           for (let i = 0; i < pages.length; i++) {
//             // Draw the image on the center of the page
//             const { width, height } = img.scale(1);
//             pages[i].drawImage(img, {
//               x: pages[i].getWidth() / 2 - width / 2,
//               y: pages[i].getHeight() / 2 - height / 2,
//               opacity: 0.3,
//               rotate: degrees(45),
//             });
//             const pdfBytes = await pdfDoc.save()
//             res.send('OK')
//         }
//         } catch(err) {
//           res.send(err)
//           console.log(err)
//         }
//       } else {
//         res.send(err)
//         console.log(err)
//       }
//     })
//     // await pdfDoc.embedPng(request(imageUrl, async function (err, response, body) {
//     //   if(response) {
//     //     const img = body
//     //     console.log(JSON.stringify(img))
//     //     const pages = pdfDoc.getPages()
//     //     for (let i = 0; i < pages.length; i++) {
//     //       // Draw the image on the center of the page
//     //       const { width, height } = img.scale(1);
//     //       pages[i].drawImage(img, {
//     //         x: pages[i].getWidth() / 2 - width / 2,
//     //         y: pages[i].getHeight() / 2 - height / 2,
//     //         opacity: 0.3,
//     //         rotate: degrees(45),
//     //       });
//     //       const pdfBytes = await pdfDoc.save()
//     //   }

//     //     // new Promise((resolve, reject) => {
        
//     //     //   const blob = bucket.file('Files/sample.pdf')
//     //     //   const blobStream = blob.createWriteStream({
//     //     //     resumable: false
//     //     //   })
//     //     //   blobStream.on('finish', () => {
//     //     //     const publicUrl = format(
//     //     //       `https://storage.googleapis.com/${bucket.name}/${blob.name}`
//     //     //     )
//     //     //     resolve(publicUrl)
//     //     //   })
//     //     //   .on('error', () => {
//     //     //     reject(`Unable to upload image, something went wrong`)
//     //     //   })
//     //     //   .end(pdfBytes)
//     //     // })


//     //     // const imageBuffer = new Uint8Array(req.rawBody);
//     //     // const file = bucket.file(`Files/sample.pdf`);

//     //     //   file.save(
//     //     //     pdfBytes,
//     //     //     { resumable: false, metadata: { contentType: "application/pdf" } },
//     //     //     err => {
//     //     //       if (err) {
//     //     //         res.status(200).send({
//     //     //           success: true,
//     //     //           message: err.message,
//     //     //           data: {
//     //     //             url: 'PDF GENERATED'
//     //     //           }
//     //     //         })
//     //     //       }
//     //     //       res.status(200).send({
//     //     //         success: true,
//     //     //         message: 'PDF Url Generated',
//     //     //         data: {
//     //     //           url: 'PDF GENERATED'
//     //     //         }
//     //     //       })
//     //     //     }
//     //     //   );
//     //   }
//     //   else {
//     //     console.log("ERROR ON LINE 204 ----->", err)
//     //   }
//     // }));
//   }
//   else {
//     res.send(err)
//     console.log("ERROR ON LINE 168 ----->", err)
//   }
// });