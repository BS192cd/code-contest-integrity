const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

class FileUtils {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
  }

  async ensureTempDir() {
    try {
      const tempExists = await exists(this.tempDir);
      if (!tempExists) {
        await mkdir(this.tempDir, { recursive: true });
      }
      return this.tempDir;
    } catch (error) {
      console.error('Error ensuring temp directory:', error);
      throw error;
    }
  }

  async createTempFile(prefix = 'temp', extension = '') {
    await this.ensureTempDir();
    const tempPath = path.join(this.tempDir, `${prefix}-${Date.now()}${extension}`);
    return {
      path: tempPath,
      write: async (content) => {
        await writeFile(tempPath, content, 'utf8');
        return tempPath;
      },
      read: async () => readFile(tempPath, 'utf8'),
      delete: async () => {
        try {
          if (await exists(tempPath)) {
            await unlink(tempPath);
          }
          return true;
        } catch (error) {
          console.error(`Error deleting ${tempPath}:`, error.message);
          return false;
        }
      }
    };
  }

  normalizePath(filePath) {
    return filePath.replace(/\\/g, '/');
  }
}

module.exports = new FileUtils();
