const express = require('express');
const router = express.Router();

const {
PdfConvertor, 
pdfDownload
 } = require('./api/index')

router.post('/pdfConvert', PdfConvertor)
router.post('/pdfDownload', pdfDownload)

module.exports = router;