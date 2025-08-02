/**
 * Test suite for Edit Mode Toggle functionality
 * Tests the basic edit mode switching UI components
 */

describe('EditModeToggle', () => {
  let mockViewer;
  let editModeToggle;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="file-viewer" class="layout-content hidden">
        <div class="p-card mb-6 sticky top-6 z-10">
          <div class="p-card-header">
            <h3 class="p-card-title text-2xl" id="file-title">Test File</h3>
            <div class="editor-toolbar" id="editor-toolbar">
              <button class="edit-toggle-btn" id="edit-toggle-btn">
                <i class="pi pi-pencil"></i> Edit
              </button>
              <span class="save-status" id="save-status">
                <i class="pi pi-check"></i> Saved
              </span>
              <button class="preview-btn" id="preview-btn">
                <i class="pi pi-eye"></i> Preview
              </button>
            </div>
          </div>
        </div>
        <div class="p-card flex-1 mb-6">
          <div class="p-card-content">
            <div id="markdown-content" class="prose">Test content</div>
            <div id="editor-container" class="hidden"></div>
          </div>
        </div>
      </div>
    `;

    // Mock the main viewer instance
    mockViewer = {
      currentFile: {
        id: 'test-id',
        fileName: 'test.md',
        fullContent: 'Test content'
      },
      isEditMode: false,
      enterEditMode: jest.fn(),
      exitEditMode: jest.fn()
    };

    // Initialize edit mode toggle (will be implemented)
    editModeToggle = new EditModeToggle(mockViewer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('初期化', () => {
    test('編集モード切り替えボタンが存在する', () => {
      const editButton = document.getElementById('edit-toggle-btn');
      expect(editButton).toBeTruthy();
      expect(editButton.textContent.trim()).toContain('Edit');
    });

    test('プレビューボタンが存在する', () => {
      const previewButton = document.getElementById('preview-btn');
      expect(previewButton).toBeTruthy();
      expect(previewButton.textContent.trim()).toContain('Preview');
    });

    test('保存状態表示が存在する', () => {
      const saveStatus = document.getElementById('save-status');
      expect(saveStatus).toBeTruthy();
    });

    test('初期状態では編集モードではない', () => {
      expect(editModeToggle.isEditMode).toBe(false);
    });
  });

  describe('編集モード切り替え', () => {
    test('編集ボタンクリックで編集モードに切り替わる', () => {
      const editButton = document.getElementById('edit-toggle-btn');
      
      editButton.click();
      
      expect(mockViewer.enterEditMode).toHaveBeenCalled();
      expect(editModeToggle.isEditMode).toBe(true);
    });

    test('編集モード時はプレビューボタンが表示される', () => {
      editModeToggle.enterEditMode();
      
      const editButton = document.getElementById('edit-toggle-btn');
      const previewButton = document.getElementById('preview-btn');
      
      expect(editButton.style.display).toBe('none');
      expect(previewButton.style.display).toBe('');
    });

    test('プレビューボタンクリックで編集モードから抜ける', () => {
      editModeToggle.enterEditMode();
      
      const previewButton = document.getElementById('preview-btn');
      previewButton.click();
      
      expect(mockViewer.exitEditMode).toHaveBeenCalled();
      expect(editModeToggle.isEditMode).toBe(false);
    });

    test('プレビューモード時は編集ボタンが表示される', () => {
      editModeToggle.enterEditMode();
      editModeToggle.exitEditMode();
      
      const editButton = document.getElementById('edit-toggle-btn');
      const previewButton = document.getElementById('preview-btn');
      
      expect(editButton.style.display).toBe('');
      expect(previewButton.style.display).toBe('none');
    });
  });

  describe('UI状態管理', () => {
    test('編集モード時にツールバーのスタイルが変更される', () => {
      const toolbar = document.getElementById('editor-toolbar');
      
      editModeToggle.enterEditMode();
      
      expect(toolbar.classList.contains('edit-mode')).toBe(true);
    });

    test('プレビューモード時にツールバーのスタイルが元に戻る', () => {
      const toolbar = document.getElementById('editor-toolbar');
      
      editModeToggle.enterEditMode();
      editModeToggle.exitEditMode();
      
      expect(toolbar.classList.contains('edit-mode')).toBe(false);
    });

    test('ファイルが選択されていない場合は編集ボタンが無効', () => {
      mockViewer.currentFile = null;
      editModeToggle = new EditModeToggle(mockViewer);
      
      const editButton = document.getElementById('edit-toggle-btn');
      expect(editButton.disabled).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    test('必要なDOM要素が存在しない場合はエラーをスロー', () => {
      document.body.innerHTML = '<div></div>';
      
      expect(() => {
        new EditModeToggle(mockViewer);
      }).toThrow('必要なDOM要素が見つかりません');
    });

    test('ファイルが読み取り専用の場合は編集モードに入れない', () => {
      mockViewer.currentFile.readOnly = true;
      editModeToggle = new EditModeToggle(mockViewer);
      
      const editButton = document.getElementById('edit-toggle-btn');
      editButton.click();
      
      expect(mockViewer.enterEditMode).not.toHaveBeenCalled();
      expect(editModeToggle.isEditMode).toBe(false);
    });
  });
});