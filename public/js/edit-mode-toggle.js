/**
 * EditModeToggle - 編集モードとプレビューモードの切り替えを管理
 */
class EditModeToggle {
  constructor(viewer) {
    this.viewer = viewer;
    this.isEditMode = false;
    
    // DOM要素の取得
    this.editButton = document.getElementById('edit-toggle-btn');
    this.previewButton = document.getElementById('preview-btn');
    this.saveStatus = document.getElementById('save-status');
    this.toolbar = document.getElementById('editor-toolbar');
    this.markdownContent = document.getElementById('markdown-content');
    this.editorContainer = document.getElementById('editor-container');
    
    // 必要な要素の存在確認
    this.validateElements();
    
    // 初期化
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
    // イベントリスナーの設定
    this.editButton.addEventListener('click', this.handleEditClick.bind(this));
    this.previewButton.addEventListener('click', this.handlePreviewClick.bind(this));
    
    // 初期状態の設定
    this.updateUIState();
  }
  
  handleEditClick() {
    // ファイルが選択されているかチェック
    if (!this.viewer.currentFile) {
      return;
    }
    
    // 読み取り専用ファイルのチェック
    if (this.viewer.currentFile.readOnly) {
      return;
    }
    
    this.enterEditMode();
  }
  
  handlePreviewClick() {
    this.exitEditMode();
  }
  
  enterEditMode() {
    this.isEditMode = true;
    
    // ビューアーに編集モードの開始を通知
    if (this.viewer.enterEditMode) {
      this.viewer.enterEditMode();
    }
    
    this.updateUIState();
  }
  
  exitEditMode() {
    this.isEditMode = false;
    
    // ビューアーに編集モードの終了を通知
    if (this.viewer.exitEditMode) {
      this.viewer.exitEditMode();
    }
    
    this.updateUIState();
  }
  
  updateUIState() {
    if (this.isEditMode) {
      // 編集モード時のUI状態
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
      // プレビューモード時のUI状態
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
    
    // ファイルが選択されていない場合は編集ボタンを無効化
    if (!this.viewer.currentFile) {
      this.editButton.disabled = true;
    } else {
      this.editButton.disabled = false;
    }
  }
  
  // 外部から状態を更新するためのメソッド
  updateFileState(file) {
    this.updateUIState();
  }
  
  // 保存状態の更新
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
}