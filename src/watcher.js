const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const EventEmitter = require('events');

class FileWatcher extends EventEmitter {
  constructor(watchPath) {
    super();
    this.watchPath = watchPath || '/Users/tehrani/Documents/claude-outputs';
    this.watcher = null;
  }

  async start() {
    console.log(`Starting file watcher on: ${this.watchPath}`);
    
    // Ensure the watch directory exists
    try {
      await fs.access(this.watchPath);
    } catch (error) {
      console.log(`Creating watch directory: ${this.watchPath}`);
      await fs.mkdir(this.watchPath, { recursive: true });
    }

    // Initialize watcher
    this.watcher = chokidar.watch(this.watchPath, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      },
      depth: 2,
      ignored: /(^|[\/\\])\../, // ignore dotfiles
    });

    // Set up event handlers
    this.watcher
      .on('add', async (filePath) => {
        const fileInfo = await this.getFileInfo(filePath);
        console.log(`File added: ${filePath}`);
        this.emit('file:added', fileInfo);
      })
      .on('change', async (filePath) => {
        const fileInfo = await this.getFileInfo(filePath);
        console.log(`File changed: ${filePath}`);
        this.emit('file:changed', fileInfo);
      })
      .on('unlink', (filePath) => {
        console.log(`File removed: ${filePath}`);
        this.emit('file:removed', { path: filePath });
      })
      .on('error', (error) => {
        console.error('Watcher error:', error);
        this.emit('error', error);
      })
      .on('ready', () => {
        console.log('File watcher is ready');
        this.emit('ready');
      });
  }

  async getFileInfo(filePath) {
    try {
      console.log(`Getting file info for: ${filePath}`);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (accessError) {
        console.error(`File not accessible: ${filePath}`, accessError.message);
        return null;
      }
      
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.watchPath, filePath);
      const fileName = path.basename(filePath);
      const dirName = path.dirname(relativePath);
      
      const fileInfo = {
        path: filePath,
        relativePath,
        fileName,
        dirName,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isMarkdown: fileName.endsWith('.md'),
        content: content.substring(0, 1000), // Preview only
        fullContent: content
      };
      
      console.log(`File info created for: ${fileName}`);
      return fileInfo;
    } catch (error) {
      console.error(`Error getting file info for ${filePath}:`, error);
      return null;
    }
  }

  async getAllFiles() {
    const files = [];
    
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await walk(fullPath);
        } else if (entry.isFile() && !entry.name.startsWith('.')) {
          files.push(fullPath);
        }
      }
    }
    
    try {
      await walk(this.watchPath);
      const fileInfos = await Promise.all(
        files.map(filePath => this.getFileInfo(filePath))
      );
      return fileInfos.filter(info => info !== null);
    } catch (error) {
      console.error('Error getting all files:', error);
      return [];
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log('File watcher stopped');
    }
  }
}

module.exports = FileWatcher;