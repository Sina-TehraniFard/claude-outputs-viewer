/**
 * Test suite for WebSocket Edit Notifications
 * Tests real-time notifications when files are edited by other users
 */

describe('WebSocketNotifications', () => {
  let mockViewer;
  let mockSocket;

  beforeEach(() => {
    // Mock WebSocket
    global.WebSocket = jest.fn().mockImplementation(() => {
      mockSocket = {
        addEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1 // OPEN
      };
      return mockSocket;
    });

    // Mock the main viewer instance
    mockViewer = {
      currentFile: {
        id: 'test-file-id',
        path: '/path/to/test.md',
        fileName: 'test.md',
        lastModified: '2025-07-30T10:00:00.000Z'
      },
      hasUnsavedChanges: false,
      editorId: 'editor-123',
      editModeToggle: {
        isEditMode: false,
        updateSaveStatus: jest.fn()
      },
      showToast: jest.fn(),
      addRecentActivity: jest.fn(),
      loadFile: jest.fn(),
      getEditorId: jest.fn().mockReturnValue('editor-123'),
      
      // Methods we're testing
      handleWebSocketMessage: function(message) {
        switch (message.type) {
          case 'file-updated':
            this.handleFileUpdatedNotification(message.data);
            break;
        }
      },
      
      handleFileUpdatedNotification: function(data) {
        const { filePath, editorId, lastModified } = data;
        
        if (editorId === this.getEditorId()) {
          return;
        }
        
        const fileName = filePath.split('/').pop() || filePath;
        this.showToast(`他のユーザーが編集中: ${fileName}`, 'info');
        this.addRecentActivity(`👥 External edit: ${fileName}`, 'info');
        
        if (this.currentFile && this.currentFile.path === filePath) {
          this.handleCurrentFileExternalUpdate(lastModified, fileName);
        }
      },
      
      handleCurrentFileExternalUpdate: function(newLastModified, fileName) {
        if (this.editModeToggle && this.editModeToggle.isEditMode && this.hasUnsavedChanges) {
          this.showToast(`警告: ${fileName} が他のユーザーによって変更されました。保存時に競合が発生する可能性があります。`, 'warning');
          
          if (this.editModeToggle) {
            this.editModeToggle.updateSaveStatus('conflict');
          }
          
          if (this.currentFile) {
            this.currentFile.lastModified = newLastModified;
          }
        } else {
          this.showToast(`${fileName} が更新されました。最新版を表示しています。`, 'info');
          this.loadFile(this.currentFile.id);
        }
      }
    };
  });

  afterEach(() => {
    delete global.WebSocket;
  });

  describe('ファイル更新通知', () => {
    test('他のユーザーのファイル更新を受信すると通知が表示される', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/other.md',
          editorId: 'editor-456', // Different editor
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith('他のユーザーが編集中: other.md', 'info');
      expect(mockViewer.addRecentActivity).toHaveBeenCalledWith('👥 External edit: other.md', 'info');
    });

    test('自分のファイル更新は無視される', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md',
          editorId: 'editor-123', // Same as our editor ID
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).not.toHaveBeenCalled();
      expect(mockViewer.addRecentActivity).not.toHaveBeenCalled();
    });

    test('現在開いているファイルが他のユーザーに更新された場合の処理', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md', // Same as current file
          editorId: 'editor-456', // Different editor
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith('他のユーザーが編集中: test.md', 'info');
      expect(mockViewer.showToast).toHaveBeenCalledWith('test.md が更新されました。最新版を表示しています。', 'info');
      expect(mockViewer.loadFile).toHaveBeenCalledWith('test-file-id');
    });
  });

  describe('競合検出', () => {
    test('編集中のファイルが他のユーザーに更新されると競合警告が表示される', () => {
      // Set up editing state with unsaved changes
      mockViewer.editModeToggle.isEditMode = true;
      mockViewer.hasUnsavedChanges = true;

      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md',
          editorId: 'editor-456',
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith(
        '警告: test.md が他のユーザーによって変更されました。保存時に競合が発生する可能性があります。', 
        'warning'
      );
      expect(mockViewer.editModeToggle.updateSaveStatus).toHaveBeenCalledWith('conflict');
      expect(mockViewer.currentFile.lastModified).toBe('2025-07-30T10:01:00.000Z');
    });

    test('編集中だが未保存の変更がない場合はファイルをリロードする', () => {
      // Set up editing state without unsaved changes
      mockViewer.editModeToggle.isEditMode = true;
      mockViewer.hasUnsavedChanges = false;

      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md',
          editorId: 'editor-456',
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith('test.md が更新されました。最新版を表示しています。', 'info');
      expect(mockViewer.loadFile).toHaveBeenCalledWith('test-file-id');
      expect(mockViewer.editModeToggle.updateSaveStatus).not.toHaveBeenCalledWith('conflict');
    });

    test('プレビューモード時は常にファイルをリロードする', () => {
      // Set up preview mode
      mockViewer.editModeToggle.isEditMode = false;
      mockViewer.hasUnsavedChanges = false;

      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md',
          editorId: 'editor-456',
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith('test.md が更新されました。最新版を表示しています。', 'info');
      expect(mockViewer.loadFile).toHaveBeenCalledWith('test-file-id');
    });
  });

  describe('ファイル名抽出', () => {
    test('パスからファイル名を正しく抽出する', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/very/long/path/to/document.md',
          editorId: 'editor-456',
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith('他のユーザーが編集中: document.md', 'info');
      expect(mockViewer.addRecentActivity).toHaveBeenCalledWith('👥 External edit: document.md', 'info');
    });

    test('パスがファイル名のみの場合も正しく処理する', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: 'simple.md',
          editorId: 'editor-456',
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalledWith('他のユーザーが編集中: simple.md', 'info');
      expect(mockViewer.addRecentActivity).toHaveBeenCalledWith('👥 External edit: simple.md', 'info');
    });
  });

  describe('エディタID比較', () => {
    test('エディタIDが一致する場合は通知をスキップ', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md',
          editorId: 'editor-123', // Same as mockViewer.getEditorId()
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).not.toHaveBeenCalled();
      expect(mockViewer.addRecentActivity).not.toHaveBeenCalled();
      expect(mockViewer.loadFile).not.toHaveBeenCalled();
    });

    test('エディタIDが異なる場合は通知を表示', () => {
      const updateMessage = {
        type: 'file-updated',
        data: {
          filePath: '/path/to/test.md',
          editorId: 'editor-456', // Different from mockViewer.getEditorId()
          lastModified: '2025-07-30T10:01:00.000Z'
        }
      };

      mockViewer.handleWebSocketMessage(updateMessage);

      expect(mockViewer.showToast).toHaveBeenCalled();
      expect(mockViewer.addRecentActivity).toHaveBeenCalled();
    });
  });
});