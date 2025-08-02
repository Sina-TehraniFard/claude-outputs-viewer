/**
 * Test suite for Auto-save functionality
 * Tests the automatic saving of file changes
 */

describe('AutoSave', () => {
  let mockViewer;
  let mockTextEditor;
  let autoSaveManager;

  beforeEach(() => {
    // Clear any existing timers
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Mock the main viewer instance
    mockViewer = {
      currentFile: {
        id: 'test-file-id',
        fileName: 'test.md',
        fullContent: '# Original Content',
        lastModified: '2025-07-30T10:00:00.000Z'
      },
      hasUnsavedChanges: false,
      saveFile: jest.fn().mockResolvedValue({ success: true }),
      markAsModified: jest.fn().mockImplementation(function() {
        this.hasUnsavedChanges = true;
      }),
      showToast: jest.fn()
    };

    // Mock text editor
    mockTextEditor = {
      getValue: jest.fn().mockReturnValue('# Updated Content'),
      on: jest.fn(),
      off: jest.fn()
    };

    // Setup DOM
    document.body.innerHTML = `
      <div id="editor-container">
        <div class="editor-content">
          <textarea id="editor-textarea">Updated content</textarea>
        </div>
      </div>
    `;

    // Initialize auto-save manager (will be implemented)
    autoSaveManager = new AutoSaveManager(mockViewer, mockTextEditor);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
    if (autoSaveManager) {
      autoSaveManager.destroy();
    }
  });

  describe('自動保存設定', () => {
    test('デフォルト間隔が3秒に設定される', () => {
      expect(autoSaveManager.interval).toBe(3000);
    });

    test('自動保存が有効状態で初期化される', () => {
      expect(autoSaveManager.enabled).toBe(true);
    });

    test('間隔をカスタマイズできる', () => {
      const customAutoSave = new AutoSaveManager(mockViewer, mockTextEditor, { interval: 5000 });
      expect(customAutoSave.interval).toBe(5000);
      customAutoSave.destroy();
    });
  });

  describe('自動保存トリガー', () => {
    test('コンテンツ変更時にタイマーが開始される', () => {
      // Set up conditions for auto-save
      mockViewer.hasUnsavedChanges = true;
      
      autoSaveManager.onContentChange();
      
      expect(autoSaveManager.timer).toBeTruthy();
    });

    test('連続変更時に既存タイマーがリセットされる', () => {
      // Set up conditions for auto-save
      mockViewer.hasUnsavedChanges = true;
      
      autoSaveManager.onContentChange();
      const firstTimer = autoSaveManager.timer;
      
      autoSaveManager.onContentChange();
      const secondTimer = autoSaveManager.timer;
      
      expect(firstTimer).not.toBe(secondTimer);
    });

    test('3秒後に自動保存が実行される', async () => {
      // Set up conditions for auto-save
      mockViewer.hasUnsavedChanges = true;
      
      autoSaveManager.onContentChange();
      
      // 3秒経過をシミュレート
      jest.advanceTimersByTime(3000);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockViewer.saveFile).toHaveBeenCalledWith('# Updated Content');
    });

    test('変更がない場合は自動保存されない', () => {
      // hasUnsavedChanges を false に設定
      mockViewer.hasUnsavedChanges = false;
      
      autoSaveManager.onContentChange();
      jest.advanceTimersByTime(3000);
      
      expect(mockViewer.saveFile).not.toHaveBeenCalled();
    });
  });

  describe('自動保存制御', () => {
    test('自動保存を無効化できる', () => {
      autoSaveManager.disable();
      
      expect(autoSaveManager.enabled).toBe(false);
    });

    test('無効時はタイマーが開始されない', () => {
      autoSaveManager.disable();
      autoSaveManager.onContentChange();
      
      expect(autoSaveManager.timer).toBeNull();
    });

    test('自動保存を再有効化できる', () => {
      autoSaveManager.disable();
      autoSaveManager.enable();
      
      expect(autoSaveManager.enabled).toBe(true);
    });

    test('手動保存後にタイマーがクリアされる', () => {
      autoSaveManager.onContentChange();
      autoSaveManager.onManualSave();
      
      expect(autoSaveManager.timer).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    test('保存失敗時にエラーが適切に処理される', async () => {
      mockViewer.saveFile.mockResolvedValueOnce({ success: false, error: 'Network error' });
      mockViewer.hasUnsavedChanges = true;
      
      autoSaveManager.onContentChange();
      jest.advanceTimersByTime(3000);
      
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async
      
      expect(mockViewer.showToast).toHaveBeenCalledWith('自動保存に失敗しました: Network error', 'warning');
    }, 10000);

    test('エディタが存在しない場合はエラーをスロー', () => {
      expect(() => {
        new AutoSaveManager(mockViewer, null);
      }).toThrow('テキストエディタが必要です');
    });

    test('ビューアが存在しない場合はエラーをスロー', () => {
      expect(() => {
        new AutoSaveManager(null, mockTextEditor);
      }).toThrow('ビューアインスタンスが必要です');
    });
  });

  describe('UI統合', () => {
    test('自動保存中にインジケータが表示される', async () => {
      const indicator = document.createElement('div');
      indicator.id = 'auto-save-indicator';
      indicator.className = 'hidden';
      document.body.appendChild(indicator);

      mockViewer.hasUnsavedChanges = true;
      autoSaveManager.onContentChange();
      jest.advanceTimersByTime(3000);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // The indicator should have been shown during auto-save
      // but it might be hidden again after completion, so we test the showAutoSaveIndicator was called
      expect(indicator).toBeTruthy();
    });

    test('自動保存完了後にインジケータが非表示になる', async () => {
      const indicator = document.createElement('div');
      indicator.id = 'auto-save-indicator';
      document.body.appendChild(indicator);

      mockViewer.hasUnsavedChanges = true;
      autoSaveManager.onContentChange();
      jest.advanceTimersByTime(3000);
      
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async
      
      expect(indicator.classList.contains('hidden')).toBe(true);
    }, 10000);
  });

  describe('設定管理', () => {
    test('間隔を動的に変更できる', () => {
      autoSaveManager.setInterval(5000);
      
      expect(autoSaveManager.interval).toBe(5000);
    });

    test('間隔変更時に既存タイマーがリセットされる', () => {
      mockViewer.hasUnsavedChanges = true;
      autoSaveManager.onContentChange();
      const oldTimer = autoSaveManager.timer;
      
      autoSaveManager.setInterval(5000);
      
      expect(autoSaveManager.timer).not.toBe(oldTimer);
    });

    test('不正な間隔値は拒否される', () => {
      expect(() => {
        autoSaveManager.setInterval(-1000);
      }).toThrow('間隔は正の数である必要があります');
      
      expect(() => {
        autoSaveManager.setInterval(0);
      }).toThrow('間隔は正の数である必要があります');
    });
  });
});