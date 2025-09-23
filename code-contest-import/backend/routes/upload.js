const express = require('express');
const router = express.Router();

const fileUploadService = require('../services/fileUploadService');
const { authenticate, requireTeacher } = require('../middleware/auth');

// All upload routes require teacher authentication
router.use(authenticate, requireTeacher);

// Upload test cases for problems
router.post('/test-cases', 
  fileUploadService.uploadMultiple('files'), 
  fileUploadService.uploadTestCases
);

// Upload contest data
router.post('/contest-data', 
  fileUploadService.uploadSingle('file'), 
  fileUploadService.uploadContestData
);

// Get uploaded file
router.get('/files/:type/:filename', fileUploadService.getFile);

// Delete uploaded file
router.delete('/files/:type/:filename', fileUploadService.deleteFile);

module.exports = router;