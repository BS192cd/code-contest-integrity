const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Create upload directory if it doesn't exist
const ensureUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const subDir = req.body.type || 'general'; // testcases, problems, etc.
    const fullPath = path.join(uploadPath, subDir);
    
    try {
      await ensureUploadDir(fullPath);
      cb(null, fullPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    cb(null, `${sanitizedBaseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    testcases: ['.txt', '.in', '.out', '.json'],
    problems: ['.txt', '.md', '.json'],
    general: ['.txt', '.json', '.csv', '.zip'],
    images: ['.jpg', '.jpeg', '.png', '.gif']
  };

  const uploadType = req.body.type || 'general';
  const allowed = allowedTypes[uploadType] || allowedTypes.general;
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${extension} not allowed for ${uploadType} uploads`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Upload handler for test cases
const uploadTestCases = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const testCases = [];
    
    // Process uploaded files
    for (const file of req.files) {
      try {
        const content = await fs.readFile(file.path, 'utf8');
        
        // Parse test case file (expecting JSON format)
        let testCase;
        if (path.extname(file.originalname) === '.json') {
          testCase = JSON.parse(content);
        } else {
          // For .txt files, assume input and output are separated by a delimiter
          const lines = content.trim().split('\n');
          const separatorIndex = lines.findIndex(line => line.trim() === '---' || line.trim() === '===');
          
          if (separatorIndex > 0) {
            testCase = {
              input: lines.slice(0, separatorIndex).join('\n'),
              expectedOutput: lines.slice(separatorIndex + 1).join('\n'),
              isPublic: false,
              points: 10
            };
          } else {
            throw new Error('Invalid test case format');
          }
        }

        testCases.push({
          ...testCase,
          originalFileName: file.originalname,
          filePath: file.path
        });

      } catch (parseError) {
        console.error(`Error parsing test case file ${file.originalname}:`, parseError);
        // Clean up the file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    if (testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid test cases found in uploaded files'
      });
    }

    res.json({
      success: true,
      data: {
        testCases,
        count: testCases.length
      },
      message: `Successfully processed ${testCases.length} test case(s)`
    });

  } catch (error) {
    console.error('Upload test cases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process uploaded test cases'
    });
  }
};

// Upload handler for contest data
const uploadContestData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const content = await fs.readFile(req.file.path, 'utf8');
    let contestData;

    try {
      if (path.extname(req.file.originalname) === '.json') {
        contestData = JSON.parse(content);
      } else if (path.extname(req.file.originalname) === '.csv') {
        // Basic CSV parsing for contest data
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        });
        contestData = { problems: data };
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file format or content'
      });
    }

    // Clean up the uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Error cleaning up file:', unlinkError);
    }

    res.json({
      success: true,
      data: contestData,
      message: 'Contest data processed successfully'
    });

  } catch (error) {
    console.error('Upload contest data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process contest data'
    });
  }
};

// Get uploaded file
const getFile = async (req, res) => {
  try {
    const { type, filename } = req.params;
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, type, filename);

    // Security check - ensure file is within upload directory
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadPath = path.normalize(uploadPath);
    
    if (!normalizedPath.startsWith(normalizedUploadPath)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file'
    });
  }
};

// Delete uploaded file
const deleteFile = async (req, res) => {
  try {
    const { type, filename } = req.params;
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, type, filename);

    // Security check
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadPath = path.normalize(uploadPath);
    
    if (!normalizedPath.startsWith(normalizedUploadPath)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    try {
      await fs.unlink(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadTestCases,
  uploadContestData,
  getFile,
  deleteFile
};