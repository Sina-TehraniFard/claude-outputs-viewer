/**
 * TextEditor - CodeMirrorベースのテキストエディタ
 */
class TextEditor {
  constructor(container, viewer) {
    this.container = container;
    this.viewer = viewer;
    this.editor = null;
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
    // エディタのHTMLを構築
    this.buildEditorHTML();
    
    // CodeMirrorエディタの初期化
    this.initCodeMirror();
    
    // イベントリスナーの設定
    this.bindEvents();
    
    // 初期ファイル内容の設定
    this.loadFileContent();
    
    // UI更新
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
          <button class="save-btn p-button p-button-sm p-button-success" id="save-btn">
            <i class="pi pi-save"></i>
            <span class="ml-1">Save</span>
          </button>
          <button class="format-btn p-button p-button-sm p-button-outlined" id="format-btn">
            <i class="pi pi-align-left"></i>
            <span class="ml-1">Format</span>
          </button>
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
    const textarea = document.getElementById('editor-textarea');
    
    if (!textarea) {
      console.error('Textarea element not found');
      return;
    }
    
    // CodeMirrorが利用可能な場合のみ初期化
    if (typeof CodeMirror !== 'undefined') {
      this.editor = CodeMirror.fromTextArea(textarea, {
        mode: this.getMode(),
        theme: this.theme === 'dark' ? 'material-darker' : 'default',
        lineNumbers: this.showLineNumbers,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        extraKeys: {
          'Ctrl-S': () => this.save(),
          'Cmd-S': () => this.save(),
          'Ctrl-/': 'toggleComment',
          'Cmd-/': 'toggleComment'
        }
      });
      
      // エディタイベントの設定
      this.editor.on('change', () => {
        this.onContentChange();
      });
      
      this.editor.on('cursorActivity', () => {
        this.updateCursorInfo();
      });
      
    } else {
      // CodeMirrorが利用できない場合のフォールバック
      console.warn('CodeMirror not available, using fallback textarea');
      this.editor = {
        getValue: () => textarea.value,
        setValue: (value) => { textarea.value = value; },
        focus: () => textarea.focus(),
        refresh: () => {},
        on: () => {},
        getDoc: () => ({
          getCursor: () => ({ line: 0, ch: 0 }),
          getValue: () => textarea.value
        })
      };
      
      // フォールバック用のイベントリスナー
      textarea.addEventListener('input', () => this.onContentChange());
      textarea.addEventListener('keyup', () => this.updateCursorInfo());
    }
  }
  
  bindEvents() {
    // 保存ボタン
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.save());
    }
    
    // フォーマットボタン
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
    } else if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
      return 'text/typescript';
    } else if (fileName.endsWith('.css')) {
      return 'css';
    } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      return 'htmlmixed';
    } else if (fileName.endsWith('.json')) {
      return 'application/json';
    } else if (fileName.endsWith('.py')) {
      return 'python';
    } else if (fileName.endsWith('.java')) {
      return 'text/x-java';
    } else {
      return 'text';
    }
  }
  
  getFileTypeDisplay() {
    const mode = this.getMode();
    const displayMap = {
      'markdown': 'Markdown',
      'javascript': 'JavaScript',
      'text/typescript': 'TypeScript',
      'css': 'CSS',
      'htmlmixed': 'HTML',
      'application/json': 'JSON',
      'python': 'Python',
      'text/x-java': 'Java',
      'text': 'Plain Text'
    };
    
    return displayMap[mode] || 'Text';
  }
  
  setFileMode() {
    if (this.editor && typeof CodeMirror !== 'undefined') {
      const mode = this.getMode();
      this.editor.setOption('mode', mode);
    }
  }
  
  onContentChange() {
    this.updateWordCount();
    
    if (this.viewer.onContentChange) {
      this.viewer.onContentChange(this.getValue());
    }
  }
  
  updateCursorInfo() {
    if (!this.editor) return;
    
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
    // 基本的なフォーマット機能
    const content = this.getValue();
    let formatted = content;
    
    // Markdownの基本的なフォーマット
    if (this.getMode() === 'markdown') {
      // 複数の空行を単一の空行に
      formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
      // 行末の空白を削除
      formatted = formatted.replace(/[ \t]+$/gm, '');
    }
    
    this.setValue(formatted);
  }
  
  setTheme(theme) {
    this.theme = theme;
    if (this.editor && typeof CodeMirror !== 'undefined') {
      this.editor.setOption('theme', theme === 'dark' ? 'material-darker' : 'default');
    }
  }
  
  setFontSize(size) {
    this.fontSize = size;
    if (this.container) {
      const editorElement = this.container.querySelector('.CodeMirror');
      if (editorElement) {
        editorElement.style.fontSize = `${size}px`;
      }
    }
  }
  
  toggleLineNumbers() {
    this.showLineNumbers = !this.showLineNumbers;
    if (this.editor && typeof CodeMirror !== 'undefined') {
      this.editor.setOption('lineNumbers', this.showLineNumbers);
    }
  }
  
  enableAutoComplete() {
    this.autoComplete = true;
    // 自動補完機能の実装（将来的な拡張）
    console.log('Auto-complete enabled');
  }
  
  // エディタの破棄
  destroy() {
    if (this.editor && this.editor.toTextArea) {
      this.editor.toTextArea();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}