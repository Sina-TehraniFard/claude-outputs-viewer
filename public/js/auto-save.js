/**
 * Auto-save Manager
 * Handles automatic saving of file changes with configurable intervals
 */

class AutoSaveManager {
  constructor(viewer, textEditor, options = {}) {
    if (!viewer) {
      throw new Error('ビューアインスタンスが必要です');
    }
    
    if (!textEditor) {
      throw new Error('テキストエディタが必要です');
    }
    
    this.viewer = viewer;
    this.textEditor = textEditor;
    this.interval = options.interval || 3000; // Default 3 seconds
    this.enabled = options.enabled !== false; // Default enabled
    this.timer = null;
    this.isAutoSaving = false;
    
    this.init();
  }
  
  init() {
    // Bind editor change events
    if (this.textEditor.on) {
      this.textEditor.on('change', this.onContentChange.bind(this));
    }
    
    console.log('AutoSaveManager initialized with interval:', this.interval);
  }
  
  onContentChange() {
    if (!this.enabled) {
      return;
    }
    
    // Clear existing timer
    this.clearTimer();
    
    // Only start auto-save if there are unsaved changes
    if (this.viewer.hasUnsavedChanges) {
      this.timer = setTimeout(() => {
        this.performAutoSave();
      }, this.interval);
      
      console.log('Auto-save timer started, will save in', this.interval, 'ms');
    }
  }
  
  async performAutoSave() {
    if (this.isAutoSaving || !this.enabled) {
      return;
    }
    
    console.log('Performing auto-save...');
    this.isAutoSaving = true;
    
    try {
      // Show auto-save indicator
      this.showAutoSaveIndicator();
      
      // Get current content from editor
      const content = this.textEditor.getValue ? this.textEditor.getValue() : '';
      
      // Only save if there are actually unsaved changes
      if (!this.viewer.hasUnsavedChanges) {
        console.log('No unsaved changes, skipping auto-save');
        return;
      }
      
      // Perform the save
      const result = await this.viewer.saveFile(content);
      
      if (result.success) {
        console.log('Auto-save completed successfully');
        this.viewer.showToast('自動保存完了', 'info');
      } else {
        console.warn('Auto-save failed:', result.error);
        this.viewer.showToast(`自動保存に失敗しました: ${result.error}`, 'warning');
      }
      
    } catch (error) {
      console.error('Auto-save error:', error);
      this.viewer.showToast(`自動保存に失敗しました: ${error.message}`, 'warning');
    } finally {
      this.isAutoSaving = false;
      this.hideAutoSaveIndicator();
      this.clearTimer();
    }
  }
  
  onManualSave() {
    // Clear auto-save timer when manual save occurs
    this.clearTimer();
    console.log('Manual save detected, auto-save timer cleared');
  }
  
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  
  enable() {
    this.enabled = true;
    console.log('Auto-save enabled');
  }
  
  disable() {
    this.enabled = false;
    this.clearTimer();
    console.log('Auto-save disabled');
  }
  
  setInterval(newInterval) {
    if (newInterval <= 0) {
      throw new Error('間隔は正の数である必要があります');
    }
    
    const oldInterval = this.interval;
    this.interval = newInterval;
    
    // If timer is running, restart it with new interval
    if (this.timer) {
      this.clearTimer();
      if (this.viewer.hasUnsavedChanges) {
        this.onContentChange();
      }
    }
    
    console.log('Auto-save interval changed from', oldInterval, 'to', newInterval);
  }
  
  showAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
      indicator.classList.remove('hidden');
    }
  }
  
  hideAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  }
  
  destroy() {
    // Clean up event listeners and timers
    this.clearTimer();
    
    if (this.textEditor.off) {
      this.textEditor.off('change', this.onContentChange);
    }
    
    this.viewer = null;
    this.textEditor = null;
    
    console.log('AutoSaveManager destroyed');
  }
}

// Make available globally for tests
if (typeof window !== 'undefined') {
  window.AutoSaveManager = AutoSaveManager;
} else if (typeof global !== 'undefined') {
  global.AutoSaveManager = AutoSaveManager;
}