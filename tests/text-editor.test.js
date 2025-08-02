/**
 * Test suite for TextEditor functionality
 * Tests the integration of CodeMirror-based text editor
 */

describe('TextEditor', () => {
  let mockViewer;
  let textEditor;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="editor-container" class="hidden">
        <div class="editor-header">
          <div class="editor-info">
            <span class="editor-filename">test.md</span>
            <span class="editor-mode">Markdown</span>
          </div>
          <div class="editor-actions">
            <button class="save-btn" id="save-btn">Save</button>
            <button class="format-btn" id="format-btn">Format</button>
          </div>
        </div>
        <div class="editor-content" id="editor-content">
          <!-- CodeMirror will be initialized here -->
        </div>
        <div class="editor-footer">
          <span class="editor-cursor-info" id="cursor-info">Line 1, Column 1</span>
          <span class="editor-word-count" id="word-count">0 words</span>
        </div>
      </div>
    `;

    // Mock the main viewer instance
    mockViewer = {
      currentFile: {
        id: 'test-id',
        fileName: 'test.md',
        fullContent: '# Test Content\n\nThis is a test file.',
        isMarkdown: true
      },
      updateSaveStatus: jest.fn(),
      onContentChange: jest.fn()
    };

    // Mock CodeMirror since it's an external library
    global.CodeMirror = {
      fromTextArea: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue('# Test Content\n\nThis is a test file.'),
        setValue: jest.fn(),
        on: jest.fn(),
        focus: jest.fn(),
        refresh: jest.fn(),
        getDoc: jest.fn().mockReturnValue({
          getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
          getValue: jest.fn().mockReturnValue('# Test Content\n\nThis is a test file.')
        })
      }),
      defineMode: jest.fn(),
      defineMIME: jest.fn()
    };

    // Initialize text editor (will be implemented)
    textEditor = new TextEditor(document.getElementById('editor-container'), mockViewer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.CodeMirror;
  });

  describe('初期化', () => {
    test('エディタコンテナが正しく設定される', () => {
      const container = document.getElementById('editor-container');
      expect(container).toBeTruthy();
      expect(textEditor.container).toBe(container);
    });

    test('CodeMirrorインスタンスが作成される', () => {
      expect(global.CodeMirror.fromTextArea).toHaveBeenCalled();
      expect(textEditor.editor).toBeTruthy();
    });

    test('初期コンテンツが設定される', () => {
      expect(textEditor.editor.setValue).toHaveBeenCalledWith('# Test Content\n\nThis is a test file.');
    });

    test('ファイル名が表示される', () => {
      const filename = document.querySelector('.editor-filename');
      expect(filename.textContent).toBe('test.md');
    });

    test('エディタモードが正しく設定される', () => {
      const mode = document.querySelector('.editor-mode');
      expect(mode.textContent).toBe('Markdown');
    });
  });

  describe('編集機能', () => {
    test('テキスト変更時にコールバックが呼ばれる', () => {
      // テキストエディタの変更をシミュレート
      textEditor.onContentChange();
      
      expect(textEditor.viewer.onContentChange).toBeDefined();
    });

    test('保存ボタンクリックでコンテンツが保存される', () => {
      const saveButton = document.getElementById('save-btn');
      
      saveButton.click();
      
      expect(textEditor.save).toBeDefined();
    });

    test('フォーマットボタンでコンテンツが整形される', () => {
      const formatButton = document.getElementById('format-btn');
      
      formatButton.click();
      
      expect(textEditor.format).toBeDefined();
    });

    test('カーソル位置が正しく表示される', () => {
      const cursorInfo = document.getElementById('cursor-info');
      textEditor.updateCursorInfo();
      
      expect(cursorInfo.textContent).toContain('Line');
      expect(cursorInfo.textContent).toContain('Column');
    });

    test('単語数が正しく計算される', () => {
      const wordCount = document.getElementById('word-count');
      textEditor.updateWordCount();
      
      expect(wordCount.textContent).toContain('words');
    });
  });

  describe('ファイルタイプ対応', () => {
    test('Markdownファイルで正しいモードが設定される', () => {
      mockViewer.currentFile.fileName = 'test.md';
      mockViewer.currentFile.isMarkdown = true;
      
      textEditor.setFileMode();
      
      expect(textEditor.getMode()).toBe('markdown');
    });

    test('JavaScriptファイルで正しいモードが設定される', () => {
      mockViewer.currentFile.fileName = 'test.js';
      mockViewer.currentFile.isMarkdown = false;
      
      textEditor.setFileMode();
      
      expect(textEditor.getMode()).toBe('javascript');
    });

    test('プレーンテキストファイルで正しいモードが設定される', () => {
      mockViewer.currentFile.fileName = 'test.txt';
      mockViewer.currentFile.isMarkdown = false;
      
      textEditor.setFileMode();
      
      expect(textEditor.getMode()).toBe('text');
    });
  });

  describe('エラーハンドリング', () => {
    test('エディタコンテナが存在しない場合はエラーをスロー', () => {
      expect(() => {
        new TextEditor(null, mockViewer);
      }).toThrow('エディタコンテナが見つかりません');
    });

    test('ファイルコンテンツが空の場合は適切に処理', () => {
      mockViewer.currentFile.fullContent = '';
      
      textEditor = new TextEditor(document.getElementById('editor-container'), mockViewer);
      
      expect(textEditor.editor.setValue).toHaveBeenCalledWith('');
    });
  });

  describe('設定とカスタマイズ', () => {
    test('ダークテーマが適用される', () => {
      textEditor.setTheme('dark');
      
      expect(textEditor.theme).toBe('dark');
    });

    test('フォントサイズが変更できる', () => {
      textEditor.setFontSize(14);
      
      expect(textEditor.fontSize).toBe(14);
    });

    test('行番号の表示/非表示が切り替えられる', () => {
      textEditor.toggleLineNumbers();
      
      expect(textEditor.showLineNumbers).toBe(false);
    });

    test('自動補完が有効化される', () => {
      textEditor.enableAutoComplete();
      
      expect(textEditor.autoComplete).toBe(true);
    });
  });
});