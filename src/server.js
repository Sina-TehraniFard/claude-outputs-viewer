const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { marked } = require('marked');
const cors = require('cors');

const FileWatcher = require('./watcher');
const Notifier = require('./notifier');

class ClaudeOutputsServer {
  constructor(options = {}) {
    this.port = options.port || 3333;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/ws'
    });
    
    this.fileWatcher = new FileWatcher();
    this.notifier = new Notifier({
      serverUrl: `http://localhost:${this.port}`
    });
    
    this.clients = new Set();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupFileWatcher();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '..', 'public')));
  }

  setupRoutes() {
    // API Routes
    this.app.get('/api/files', async (req, res) => {
      try {
        const files = await this.fileWatcher.getAllFiles();
        const grouped = this.groupFilesByDate(files);
        res.json({ success: true, data: grouped });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/files/:date', async (req, res) => {
      try {
        const { date } = req.params;
        const files = await this.fileWatcher.getAllFiles();
        const filtered = files.filter(file => 
          file.dirName === date || file.dirName.endsWith(date)
        );
        res.json({ success: true, data: filtered });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/file/:id(*)', async (req, res) => {
      try {
        const { id } = req.params;
        console.log('Fetching file with ID:', id);
        
        let filePath;
        try {
          // Decode Base64 then URI decode for UTF-8 strings  
          console.log('Raw ID:', id);
          const base64Decoded = Buffer.from(id, 'base64').toString('utf8');
          console.log('Base64 decoded:', base64Decoded);
          filePath = decodeURIComponent(base64Decoded);
          console.log('Final decoded file path:', filePath);
        } catch (decodeError) {
          console.error('Base64 decode error:', decodeError);
          console.error('Failed ID:', id);
          return res.status(400).json({ success: false, error: 'Invalid file ID format' });
        }
        
        const fileInfo = await this.fileWatcher.getFileInfo(filePath);
        console.log('File info result:', fileInfo ? 'Found' : 'Not found');
        
        if (!fileInfo) {
          return res.status(404).json({ success: false, error: 'File not found' });
        }

        if (fileInfo.isMarkdown) {
          fileInfo.htmlContent = marked(fileInfo.fullContent);
        }

        res.json({ success: true, data: fileInfo });
      } catch (error) {
        console.error('API file fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // File save endpoint
    this.app.put('/api/file/:id(*)', async (req, res) => {
      try {
        const { id } = req.params;
        const { content, lastModified, editorId } = req.body;
        console.log('Saving file with ID:', id);
        
        let filePath;
        try {
          // Decode Base64 then URI decode for UTF-8 strings  
          const base64Decoded = Buffer.from(id, 'base64').toString('utf8');
          filePath = decodeURIComponent(base64Decoded);
          console.log('Decoded file path for saving:', filePath);
        } catch (decodeError) {
          console.error('Base64 decode error:', decodeError);
          return res.status(400).json({ success: false, error: 'Invalid file ID format' });
        }
        
        const fs = require('fs').promises;
        
        // Check if file exists and get current stats
        let currentStats;
        let isNewFile = false;
        
        try {
          currentStats = await fs.stat(filePath);
        } catch (accessError) {
          // File doesn't exist, this will be a new file creation
          isNewFile = true;
          console.log('Creating new file:', filePath);
        }
        
        // For existing files, check for conflicts by comparing last modified times
        if (!isNewFile && lastModified) {
          const currentModified = currentStats.mtime.toISOString();
          if (currentModified !== lastModified) {
            // Read current file content for conflict resolution
            const currentContent = await fs.readFile(filePath, 'utf8');
            
            return res.json({
              success: false,
              error: 'CONFLICT_DETECTED',
              data: {
                serverContent: currentContent,
                serverModified: currentModified,
                clientContent: content
              }
            });
          }
        }
        
        // Ensure directory exists for new files
        if (isNewFile) {
          const dirPath = path.dirname(filePath);
          await fs.mkdir(dirPath, { recursive: true });
        }
        
        // Write the file
        await fs.writeFile(filePath, content, 'utf8');
        
        // Get updated file stats
        const updatedStats = await fs.stat(filePath);
        const updatedModified = updatedStats.mtime.toISOString();
        
        console.log('File saved successfully:', filePath);
        
        // Notify all connected clients about the file change
        this.broadcast({
          type: 'file-updated',
          data: {
            filePath: filePath,
            editorId: editorId,
            lastModified: updatedModified
          }
        });
        
        res.json({
          success: true,
          data: {
            lastModified: updatedModified,
            size: updatedStats.size,
            conflict: false
          }
        });
      } catch (error) {
        console.error('File save error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/search', async (req, res) => {
      try {
        const { q: query } = req.query;
        if (!query) {
          return res.status(400).json({ success: false, error: 'Query parameter required' });
        }

        const files = await this.fileWatcher.getAllFiles();
        const results = files.filter(file => {
          const searchText = `${file.fileName} ${file.content}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.delete('/api/file/:id(*)', async (req, res) => {
      try {
        const { id } = req.params;
        console.log('Deleting file with ID:', id);
        
        let filePath;
        try {
          // Decode Base64 then URI decode for UTF-8 strings  
          const base64Decoded = Buffer.from(id, 'base64').toString('utf8');
          filePath = decodeURIComponent(base64Decoded);
          console.log('Decoded file path for deletion:', filePath);
        } catch (decodeError) {
          console.error('Base64 decode error:', decodeError);
          return res.status(400).json({ success: false, error: 'Invalid file ID format' });
        }
        
        // Check if file exists
        const fs = require('fs').promises;
        try {
          await fs.access(filePath);
        } catch (accessError) {
          return res.status(404).json({ success: false, error: 'File not found' });
        }
        
        // Delete the file
        await fs.unlink(filePath);
        console.log('File deleted successfully:', filePath);
        
        res.json({ success: true, message: 'File deleted successfully' });
      } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Settings API
    this.app.post('/api/settings/notifications', (req, res) => {
      try {
        const { enabled } = req.body;
        this.notifier.setEnabled(enabled);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/settings/auto-open', (req, res) => {
      try {
        const { enabled } = req.body;
        this.notifier.setAutoOpen(enabled);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Serve main page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  setupFileWatcher() {
    this.fileWatcher.on('file:added', (fileInfo) => {
      this.broadcast({
        type: 'file:added',
        data: fileInfo
      });
      this.notifier.notifyFileAdded(fileInfo);
    });

    this.fileWatcher.on('file:changed', (fileInfo) => {
      this.broadcast({
        type: 'file:changed',
        data: fileInfo
      });
      this.notifier.notifyFileChanged(fileInfo);
    });

    this.fileWatcher.on('file:removed', (fileInfo) => {
      this.broadcast({
        type: 'file:removed',
        data: fileInfo
      });
    });

    this.fileWatcher.on('error', (error) => {
      console.error('File watcher error:', error);
      this.broadcast({
        type: 'error',
        data: { message: error.message }
      });
    });
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  groupFilesByDate(files) {
    const grouped = {};
    files.forEach(file => {
      const dateKey = file.dirName || 'root';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(file);
    });

    // Sort dates descending
    const sortedKeys = Object.keys(grouped).sort().reverse();
    const sorted = {};
    sortedKeys.forEach(key => {
      sorted[key] = grouped[key].sort((a, b) => 
        new Date(b.modified) - new Date(a.modified)
      );
    });

    return sorted;
  }

  async start() {
    try {
      await this.fileWatcher.start();
      
      this.server.listen(this.port, 'localhost', () => {
        console.log(`🚀 Claude Outputs Viewer running at http://localhost:${this.port}`);
        console.log(`📁 Watching: ${this.fileWatcher.watchPath}`);
        console.log('🔔 Notifications enabled');
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  stop() {
    this.fileWatcher.stop();
    this.server.close();
    console.log('Server stopped');
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new ClaudeOutputsServer();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    server.stop();
    process.exit(0);
  });

  server.start();
}

module.exports = ClaudeOutputsServer;