const notifier = require('node-notifier');
const open = require('open');

class Notifier {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.autoOpen = options.autoOpen !== false;
    this.serverUrl = options.serverUrl || 'http://localhost:3333';
  }

  async notifyFileAdded(fileInfo) {
    console.log('notifyFileAdded called:', { enabled: this.enabled, fileName: fileInfo?.fileName });
    
    if (!this.enabled) {
      console.log('Notifications disabled, skipping');
      return;
    }

    const title = 'New Claude Output';
    const message = `Created: ${fileInfo.fileName}`;
    const subtitle = `Directory: ${fileInfo.dirName}`;

    console.log('Sending notification:', { title, message, subtitle });

    try {
      await this.sendNotification({
        title,
        message,
        subtitle,
        sound: 'Ping',
        icon: this.getIconPath(),
        timeout: 10,
        actions: ['View', 'Dismiss'],
        reply: false
      });
      console.log('Notification sent successfully');

      if (this.autoOpen) {
        console.log('Auto-opening browser disabled temporarily due to open package error');
        // await this.openInBrowser(fileInfo);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async notifyFileChanged(fileInfo) {
    if (!this.enabled) return;

    const title = 'Claude Output Updated';
    const message = `Modified: ${fileInfo.fileName}`;
    const subtitle = `Directory: ${fileInfo.dirName}`;

    try {
      await this.sendNotification({
        title,
        message,
        subtitle,
        sound: 'Glass',
        icon: this.getIconPath(),
        timeout: 5,
        actions: ['View', 'Dismiss'],
        reply: false
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async sendNotification(options) {
    return new Promise((resolve, reject) => {
      // Use terminal-notifier for better macOS compatibility
      const { exec } = require('child_process');
      const cmd = `terminal-notifier -message "${options.message}" -title "${options.title}" -subtitle "${options.subtitle || ''}" -sound "${options.sound || 'Ping'}"`;
      
      console.log('Executing notification command:', cmd);
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('terminal-notifier error:', error);
          // Fallback to node-notifier
          notifier.notify(options, (fallbackError, response, metadata) => {
            if (fallbackError) {
              reject(fallbackError);
            } else {
              if (response === 'activate' || metadata?.activationType === 'actionClicked') {
                this.handleNotificationClick();
              }
              resolve({ response, metadata });
            }
          });
        } else {
          console.log('Notification sent via terminal-notifier');
          resolve({ response: 'sent', stdout, stderr });
        }
      });
    });
  }

  async openInBrowser(fileInfo) {
    try {
      const url = `${this.serverUrl}?file=${encodeURIComponent(fileInfo.relativePath)}`;
      await open(url);
      console.log(`Opened browser: ${url}`);
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  }

  handleNotificationClick() {
    this.openInBrowser({ relativePath: '' });
  }

  getIconPath() {
    // You can add a custom icon here
    return null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoOpen(autoOpen) {
    this.autoOpen = autoOpen;
    console.log(`Auto-open ${autoOpen ? 'enabled' : 'disabled'}`);
  }

  setServerUrl(url) {
    this.serverUrl = url;
    console.log(`Server URL set to: ${url}`);
  }
}

module.exports = Notifier;