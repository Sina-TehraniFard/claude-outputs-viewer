// Test setup file

// Mock CodeMirror for tests
global.CodeMirror = {
  fromTextArea: jest.fn().mockReturnValue({
    getValue: jest.fn().mockReturnValue('# Test Content\n\nThis is a test file.'),
    setValue: jest.fn(),
    on: jest.fn(),
    focus: jest.fn(),
    refresh: jest.fn(),
    setOption: jest.fn(),
    toTextArea: jest.fn(),
    getDoc: jest.fn().mockReturnValue({
      getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
      getValue: jest.fn().mockReturnValue('# Test Content\n\nThis is a test file.')
    })
  }),
  defineMode: jest.fn(),
  defineMIME: jest.fn()
};

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless DEBUG is set
  log: process.env.DEBUG ? console.log : jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Mock TextEditor class for tests
global.TextEditor = class MockTextEditor {
  constructor(container, viewer) {
    this.container = container;
    this.viewer = viewer;
    this.editor = global.CodeMirror.fromTextArea();
    this.theme = 'dark';
    this.fontSize = 14;
    this.showLineNumbers = true;
    this.autoComplete = false;
    
    if (!this.container) {
      throw new Error('エディタコンテナが見つかりません');
    }
    
    this.init();
  }
  
  init() {
    this.buildEditorHTML();
    this.initCodeMirror();
    this.bindEvents();
    this.loadFileContent();
    this.updateFileInfo();
  }
  
  buildEditorHTML() {
    this.container.innerHTML = `
      <div class="editor-header">
        <div class="editor-info">
          <span class="editor-filename">${this.viewer.currentFile?.fileName || 'Untitled'}</span>
          <span class="editor-mode">${this.getFileTypeDisplay()}</span>
        </div>
        <div class="editor-actions">
          <button class="save-btn" id="save-btn">Save</button>
          <button class="format-btn" id="format-btn">Format</button>
        </div>
      </div>
      <div class="editor-content" id="editor-content">
        <textarea id="editor-textarea"></textarea>
      </div>
      <div class="editor-footer">
        <span class="editor-cursor-info" id="cursor-info">Line 1, Column 1</span>
        <span class="editor-word-count" id="word-count">0 words</span>
      </div>
    `;
  }
  
  initCodeMirror() {
    // Mock initialization
  }
  
  bindEvents() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.save());
    }
    
    const formatBtn = document.getElementById('format-btn');
    if (formatBtn) {
      formatBtn.addEventListener('click', () => this.format());
    }
  }
  
  loadFileContent() {
    if (this.viewer.currentFile && this.editor) {
      const content = this.viewer.currentFile.fullContent || '';
      this.editor.setValue(content);
      this.updateWordCount();
    }
  }
  
  onContentChange() {
    this.updateWordCount();
    
    if (this.viewer.onContentChange) {
      this.viewer.onContentChange(this.getValue());
    }
  }
  
  updateFileInfo() {
    const filename = document.querySelector('.editor-filename');
    const mode = document.querySelector('.editor-mode');
    
    if (filename && this.viewer.currentFile) {
      filename.textContent = this.viewer.currentFile.fileName;
    }
    
    if (mode) {
      mode.textContent = this.getFileTypeDisplay();
    }
  }
  
  getMode() {
    if (!this.viewer.currentFile) return 'text';
    
    const fileName = this.viewer.currentFile.fileName.toLowerCase();
    
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
      return 'markdown';
    } else if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) {
      return 'javascript';
    } else {
      return 'text';
    }
  }
  
  getFileTypeDisplay() {
    const mode = this.getMode();
    const displayMap = {
      'markdown': 'Markdown',
      'javascript': 'JavaScript',
      'text': 'Plain Text'
    };
    
    return displayMap[mode] || 'Text';
  }
  
  setFileMode() {
    // Mock method
  }
  
  updateCursorInfo() {
    const cursorInfo = document.getElementById('cursor-info');
    if (cursorInfo) {
      const cursor = this.editor.getDoc().getCursor();
      cursorInfo.textContent = `Line ${cursor.line + 1}, Column ${cursor.ch + 1}`;
    }
  }
  
  updateWordCount() {
    const wordCount = document.getElementById('word-count');
    if (wordCount && this.editor) {
      const content = this.editor.getValue();
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      wordCount.textContent = `${words.length} words`;
    }
  }
  
  getValue() {
    return this.editor ? this.editor.getValue() : '';
  }
  
  setValue(content) {
    if (this.editor) {
      this.editor.setValue(content);
      this.updateWordCount();
    }
  }
  
  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }
  
  refresh() {
    if (this.editor) {
      this.editor.refresh();
    }
  }
  
  save() {
    if (this.viewer.saveFile) {
      const content = this.getValue();
      this.viewer.saveFile(content);
    }
  }
  
  format() {
    // Mock format
  }
  
  setTheme(theme) {
    this.theme = theme;
  }
  
  setFontSize(size) {
    this.fontSize = size;
  }
  
  toggleLineNumbers() {
    this.showLineNumbers = !this.showLineNumbers;
  }
  
  enableAutoComplete() {
    this.autoComplete = true;
  }
  
  destroy() {
    if (this.editor && this.editor.toTextArea) {
      this.editor.toTextArea();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
};

// Mock AutoSaveManager class for tests
global.AutoSaveManager = class MockAutoSaveManager {
  constructor(viewer, textEditor, options = {}) {
    if (!viewer) {
      throw new Error('ビューアインスタンスが必要です');
    }
    
    if (!textEditor) {
      throw new Error('テキストエディタが必要です');
    }
    
    this.viewer = viewer;
    this.textEditor = textEditor;
    this.interval = options.interval || 3000;
    this.enabled = options.enabled !== false;
    this.timer = null;
    this.isAutoSaving = false;
    
    this.init();
  }
  
  init() {
    if (this.textEditor.on) {
      this.textEditor.on('change', this.onContentChange.bind(this));
    }
  }
  
  onContentChange() {
    if (!this.enabled) {
      return;
    }
    
    this.clearTimer();
    
    if (this.viewer.hasUnsavedChanges) {
      this.timer = setTimeout(() => {
        this.performAutoSave();
      }, this.interval);
    }
  }
  
  async performAutoSave() {
    if (this.isAutoSaving || !this.enabled) {
      return;
    }
    
    this.isAutoSaving = true;
    
    try {
      this.showAutoSaveIndicator();
      
      const content = this.textEditor.getValue ? this.textEditor.getValue() : '';
      
      if (!this.viewer.hasUnsavedChanges) {
        return;
      }
      
      const result = await this.viewer.saveFile(content);
      
      if (result.success) {
        this.viewer.showToast('自動保存完了', 'info');
      } else {
        this.viewer.showToast(`自動保存に失敗しました: ${result.error}`, 'warning');
      }
      
    } catch (error) {
      this.viewer.showToast(`自動保存に失敗しました: ${error.message}`, 'warning');
    } finally {
      this.isAutoSaving = false;
      this.hideAutoSaveIndicator();
      this.clearTimer();
    }
  }
  
  onManualSave() {
    this.clearTimer();
  }
  
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
    this.clearTimer();
  }
  
  setInterval(newInterval) {
    if (newInterval <= 0) {
      throw new Error('間隔は正の数である必要があります');
    }
    
    this.interval = newInterval;
    
    if (this.timer) {
      this.clearTimer();
      if (this.viewer.hasUnsavedChanges) {
        this.onContentChange();
      }
    }
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
    this.clearTimer();
    
    if (this.textEditor.off) {
      this.textEditor.off('change', this.onContentChange);
    }
    
    this.viewer = null;
    this.textEditor = null;
  }
};

// Mock EditModeToggle class for tests
global.EditModeToggle = class MockEditModeToggle {
  constructor(viewer) {
    this.viewer = viewer;
    this.isEditMode = false;
    
    // Mock DOM elements
    this.editButton = document.getElementById('edit-toggle-btn');
    this.previewButton = document.getElementById('preview-btn');
    this.saveStatus = document.getElementById('save-status');
    this.toolbar = document.getElementById('editor-toolbar');
    this.markdownContent = document.getElementById('markdown-content');
    this.editorContainer = document.getElementById('editor-container');
    
    this.validateElements();
    this.init();
  }
  
  validateElements() {
    const requiredElements = [
      { element: this.editButton, name: 'edit-toggle-btn' },
      { element: this.previewButton, name: 'preview-btn' },
      { element: this.saveStatus, name: 'save-status' },
      { element: this.toolbar, name: 'editor-toolbar' },
      { element: this.markdownContent, name: 'markdown-content' }
    ];
    
    for (const { element, name } of requiredElements) {
      if (!element) {
        throw new Error(`必要なDOM要素が見つかりません: ${name}`);
      }
    }
  }
  
  init() {
    this.editButton.addEventListener('click', this.handleEditClick.bind(this));
    this.previewButton.addEventListener('click', this.handlePreviewClick.bind(this));
    this.updateUIState();
  }
  
  handleEditClick() {
    if (!this.viewer.currentFile || this.viewer.currentFile.readOnly) {
      return;
    }
    this.enterEditMode();
  }
  
  handlePreviewClick() {
    this.exitEditMode();
  }
  
  enterEditMode() {
    this.isEditMode = true;
    if (this.viewer.enterEditMode) {
      this.viewer.enterEditMode();
    }
    this.updateUIState();
  }
  
  exitEditMode() {
    this.isEditMode = false;
    if (this.viewer.exitEditMode) {
      this.viewer.exitEditMode();
    }
    this.updateUIState();
  }
  
  updateUIState() {
    if (this.isEditMode) {
      this.editButton.style.display = 'none';
      this.previewButton.style.display = '';
      this.toolbar.classList.add('edit-mode');
      
      if (this.markdownContent) {
        this.markdownContent.classList.add('hidden');
      }
      if (this.editorContainer) {
        this.editorContainer.classList.remove('hidden');
      }
    } else {
      this.editButton.style.display = '';
      this.previewButton.style.display = 'none';
      this.toolbar.classList.remove('edit-mode');
      
      if (this.markdownContent) {
        this.markdownContent.classList.remove('hidden');
      }
      if (this.editorContainer) {
        this.editorContainer.classList.add('hidden');
      }
    }
    
    if (!this.viewer.currentFile) {
      this.editButton.disabled = true;
    } else {
      this.editButton.disabled = false;
    }
  }
  
  updateFileState(file) {
    this.updateUIState();
  }
  
  updateSaveStatus(status) {
    if (!this.saveStatus) return;
    
    const iconElement = this.saveStatus.querySelector('i');
    const textElement = this.saveStatus.querySelector('.status-text') || 
                      (() => {
                        const span = document.createElement('span');
                        span.className = 'status-text ml-1';
                        this.saveStatus.appendChild(span);
                        return span;
                      })();
    
    switch (status) {
      case 'saving':
        iconElement.className = 'pi pi-spin pi-spinner';
        textElement.textContent = '保存中...';
        this.saveStatus.className = 'save-status saving';
        break;
      case 'saved':
        iconElement.className = 'pi pi-check';
        textElement.textContent = '保存済み';
        this.saveStatus.className = 'save-status saved';
        break;
      case 'error':
        iconElement.className = 'pi pi-times';
        textElement.textContent = '保存失敗';
        this.saveStatus.className = 'save-status error';
        break;
      case 'conflict':
        iconElement.className = 'pi pi-exclamation-triangle';
        textElement.textContent = '競合検出';
        this.saveStatus.className = 'save-status conflict';
        break;
      default:
        iconElement.className = 'pi pi-check';
        textElement.textContent = '保存済み';
        this.saveStatus.className = 'save-status';
    }
  }
};