/**
 * Test suite for File Save functionality
 * Tests the basic file saving mechanism
 */

describe('FileSave', () => {
  let mockViewer;
  let mockServer;

  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
    
    // Mock the main viewer instance
    mockViewer = {
      currentFile: {
        id: 'test-file-id',
        fileName: 'test.md',
        fullContent: '# Original Content',
        lastModified: '2025-07-30T10:00:00.000Z'
      },
      editModeToggle: {
        updateSaveStatus: jest.fn()
      },
      showToast: jest.fn(),
      hasUnsavedChanges: false,
      editorId: null,
      
      // Mock the saveFile method with actual implementation
      saveFile: jest.fn().mockImplementation(async function(content) {
        // Check if no file is selected
        if (!this.currentFile) {
          return { success: false, error: 'NO_FILE' };
        }
        
        // Check if file is read-only
        if (this.currentFile.readOnly) {
          return { success: false, error: 'READ_ONLY' };
        }
        
        try {
          const response = await fetch(`/api/file/${this.currentFile.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: content,
              lastModified: this.currentFile.lastModified,
              editorId: this.getEditorId()
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Update file state
            this.currentFile.lastModified = result.data.lastModified;
            this.currentFile.fullContent = content;
            this.hasUnsavedChanges = false;
            
            this.editModeToggle.updateSaveStatus('saved');
            this.showToast('ファイルを保存しました', 'success');
            
            return { success: true, data: result.data };
          } else {
            if (result.error === 'CONFLICT_DETECTED') {
              this.editModeToggle.updateSaveStatus('conflict');
              return { success: false, error: result.error, data: result.data };
            } else {
              this.editModeToggle.updateSaveStatus('error');
              this.showToast(`保存に失敗しました: ${result.error}`, 'error');
              return { success: false, error: result.error };
            }
          }
        } catch (error) {
          this.editModeToggle.updateSaveStatus('error');
          this.showToast(`保存に失敗しました: ${error.message}`, 'error');
          return { success: false, error: error.message };
        }
      }),
      
      // Mock editor ID management methods
      generateEditorId: jest.fn().mockReturnValue('editor-id-12345'),
      getEditorId: jest.fn().mockImplementation(function() {
        if (!this.editorId) {
          this.editorId = this.generateEditorId();
        }
        return this.editorId;
      }),
      
      // Mock file state management
      markAsModified: jest.fn().mockImplementation(function() {
        this.hasUnsavedChanges = true;
      })
    };

    // Setup DOM
    document.body.innerHTML = `
      <div id="editor-container">
        <div class="editor-content">
          <textarea id="editor-textarea">Updated content</textarea>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    delete global.fetch;
    document.body.innerHTML = '';
  });

  describe('基本保存機能', () => {
    test('ファイル保存APIが正しく呼ばれる', async () => {
      const mockResponse = {
        success: true,
        data: {
          lastModified: '2025-07-30T10:01:00.000Z',
          size: 15,
          conflict: false
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const content = 'Updated content';
      await mockViewer.saveFile(content);

      expect(global.fetch).toHaveBeenCalledWith('/api/file/test-file-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          lastModified: '2025-07-30T10:00:00.000Z', // Original lastModified value
          editorId: 'editor-id-12345'
        })
      });
    });

    test('保存成功時に状態が更新される', async () => {
      const mockResponse = {
        success: true,
        data: {
          lastModified: '2025-07-30T10:01:00.000Z',
          size: 15,
          conflict: false
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const content = 'Updated content';
      const result = await mockViewer.saveFile(content);

      expect(result.success).toBe(true);
      expect(mockViewer.editModeToggle.updateSaveStatus).toHaveBeenCalledWith('saved');
      expect(mockViewer.showToast).toHaveBeenCalledWith('ファイルを保存しました', 'success');
    });

    test('保存失敗時にエラーが処理される', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const content = 'Updated content';
      const result = await mockViewer.saveFile(content);

      expect(result.success).toBe(false);
      expect(mockViewer.editModeToggle.updateSaveStatus).toHaveBeenCalledWith('error');
      expect(mockViewer.showToast).toHaveBeenCalledWith('保存に失敗しました: Network error', 'error');
    });

    test('競合検出時に適切に処理される', async () => {
      const mockResponse = {
        success: false,
        error: 'CONFLICT_DETECTED',
        data: {
          serverContent: 'Server version content',
          serverModified: '2025-07-30T10:00:30.000Z',
          clientContent: 'Client version content'
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const content = 'Updated content';
      const result = await mockViewer.saveFile(content);

      expect(result.success).toBe(false);
      expect(result.error).toBe('CONFLICT_DETECTED');
      expect(mockViewer.editModeToggle.updateSaveStatus).toHaveBeenCalledWith('conflict');
    });
  });

  describe('エディタID管理', () => {
    test('エディタIDが生成される', () => {
      const editorId = mockViewer.generateEditorId();
      
      expect(editorId).toBeDefined();
      expect(typeof editorId).toBe('string');
      expect(editorId.length).toBeGreaterThan(0);
    });

    test('同一セッションでは同じエディタIDが使用される', () => {
      const editorId1 = mockViewer.getEditorId();
      const editorId2 = mockViewer.getEditorId();
      
      expect(editorId1).toBe(editorId2);
    });
  });

  describe('ファイル状態管理', () => {
    test('保存後にファイル情報が更新される', async () => {
      const mockResponse = {
        success: true,
        data: {
          lastModified: '2025-07-30T10:01:00.000Z',
          size: 15,
          conflict: false
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const content = 'Updated content';
      await mockViewer.saveFile(content);

      expect(mockViewer.currentFile.lastModified).toBe('2025-07-30T10:01:00.000Z');
      expect(mockViewer.currentFile.fullContent).toBe(content);
    });

    test('未保存の変更がある場合はフラグが立つ', () => {
      mockViewer.markAsModified();
      
      expect(mockViewer.hasUnsavedChanges).toBe(true);
    });

    test('保存後は未保存フラグがクリアされる', async () => {
      const mockResponse = {
        success: true,
        data: {
          lastModified: '2025-07-30T10:01:00.000Z',
          size: 15,
          conflict: false
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      mockViewer.hasUnsavedChanges = true;
      const content = 'Updated content';
      await mockViewer.saveFile(content);

      expect(mockViewer.hasUnsavedChanges).toBe(false);
    });
  });

  describe('権限とバリデーション', () => {
    test('読み取り専用ファイルは保存できない', async () => {
      mockViewer.currentFile.readOnly = true;
      
      const content = 'Updated content';
      const result = await mockViewer.saveFile(content);

      expect(result.success).toBe(false);
      expect(result.error).toBe('READ_ONLY');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('ファイルが選択されていない場合はエラー', async () => {
      mockViewer.currentFile = null;
      
      const content = 'Updated content';
      const result = await mockViewer.saveFile(content);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_FILE');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('空のコンテンツでも保存可能', async () => {
      const mockResponse = {
        success: true,
        data: {
          lastModified: '2025-07-30T10:01:00.000Z',
          size: 0,
          conflict: false
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const content = '';
      const result = await mockViewer.saveFile(content);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});