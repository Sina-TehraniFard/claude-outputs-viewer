class ClaudeOutputsViewer {
  constructor() {
    console.log('Initializing ClaudeOutputsViewer...');
    this.socket = null;
    this.currentFile = null;
    this.files = {};
    this.isRawView = false;
    this.startTime = Date.now();
    this.fileCount = 0;
    this.recentActivity = [];
    this.editModeToggle = null;
    this.textEditor = null;
    this.editorId = null;
    this.hasUnsavedChanges = false;
    
    console.log('Calling initialization methods...');
    this.initElements();
    this.bindEvents();
    this.initWebSocket();
    this.initDashboard();
    this.initEditMode();
    
    // Hide view mode switch in header initially
    if (this.viewModeSwitch) {
      this.viewModeSwitch.classList.add('hidden');
    }
    
    // Load files after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (document.readyState === 'complete') {
        console.log('DOM is ready, loading files...');
        this.loadFiles();
      } else {
        console.log('DOM not ready, waiting longer...');
        setTimeout(() => this.loadFiles(), 500);
      }
    }, 200);
  }

  initElements() {
    // Status elements
    this.statusDot = document.getElementById('status-dot');
    this.statusText = document.getElementById('status-text');
    
    // Search elements
    this.searchInput = document.getElementById('search-input');
    // Note: No search button in current HTML layout
    
    // File tree
    this.fileTree = document.getElementById('file-tree');
    console.log('File tree element:', this.fileTree);
    this.refreshButton = document.getElementById('refresh-button');
    
    // Content area
    this.welcomeScreen = document.getElementById('welcome-screen');
    this.filesView = document.getElementById('files-view');
    this.favoritesView = document.getElementById('favorites-view');
    this.fileViewer = document.getElementById('file-viewer');
    this.fileTitle = document.getElementById('file-title');
    this.fileMeta = document.querySelector('.file-meta');
    this.markdownContent = document.getElementById('markdown-content');
    this.rawContent = document.getElementById('raw-content');
    
    // View buttons - Updated for layout menu
    this.dashboardButton = document.getElementById('dashboard-button');
    this.filesButton = document.getElementById('files-button');
    this.favoritesButton = document.getElementById('favorites-button');
    this.viewModeToggle = document.getElementById('view-mode-toggle');
    this.viewModeSwitch = document.getElementById('header-view-switch');
    
    // Favorites functionality
    this.favorites = this.loadFavorites();
    
    // Settings
    this.settingsButton = document.getElementById('settings-button');
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsButton = document.getElementById('close-settings');
    this.notificationsCheckbox = document.getElementById('notifications-enabled');
    this.autoOpenCheckbox = document.getElementById('auto-open-enabled');
    
    // Clear favorites button
    this.clearFavoritesBtn = document.getElementById('clear-favorites-btn');
    
    // Stats
    this.totalFiles = document.getElementById('total-files');
    this.totalDates = document.getElementById('total-dates');
    
    // Toast container
    this.toastContainer = document.getElementById('toast-container');
    
    // Layout sidebar
    this.sidebar = document.querySelector('.layout-sidebar');
    
    // Image zoom modal
    this.imageZoomModal = document.getElementById('image-zoom-modal');
    this.zoomImage = document.getElementById('zoom-image');
    this.zoomWrapper = document.getElementById('image-zoom-wrapper');
    this.zoomTitle = document.getElementById('zoom-image-title');
    this.zoomSize = document.getElementById('zoom-image-size');
    this.zoomLevel = document.getElementById('zoom-level');
    
    console.log('Zoom modal elements:', {
      modal: !!this.imageZoomModal,
      image: !!this.zoomImage,
      wrapper: !!this.zoomWrapper,
      title: !!this.zoomTitle,
      size: !!this.zoomSize,
      level: !!this.zoomLevel
    });
    
    // Zoom state
    this.currentZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
  }

  bindEvents() {
    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
      this.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSearch();
      });
      this.searchInput.addEventListener('input', this.toggleSearchClearButton.bind(this));
    }

    // Search clear button
    const searchClearBtn = document.getElementById('search-clear');
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', this.clearSearch.bind(this));
    }

    // Refresh
    if (this.refreshButton) {
      this.refreshButton.addEventListener('click', this.loadFiles.bind(this));
    }

    // Remove duplicate view toggle listeners
    
    // Navigation menu
    if (this.dashboardButton) {
      this.dashboardButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.showDashboard();
        this.setActiveMenuItem(this.dashboardButton);
      });
    }
    
    if (this.filesButton) {
      this.filesButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.showFilesView();
        this.showSidebarDirectories();
        this.updateFilesMenuIcon(true);
      });
    }
    
    if (this.favoritesButton) {
      this.favoritesButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.showFavoritesView();
      });
    }
    
    
    if (this.viewModeToggle) {
      this.viewModeToggle.addEventListener('change', (e) => {
        this.isRawView = e.target.checked;
        if (this.currentFile) {
          this.renderFile();
        }
      });
    }

    // Settings
    if (this.settingsButton) {
      this.settingsButton.addEventListener('click', this.openSettings.bind(this));
    }
    if (this.closeSettingsButton) {
      this.closeSettingsButton.addEventListener('click', this.closeSettings.bind(this));
    }
    
    // Clear favorites button
    if (this.clearFavoritesBtn) {
      this.clearFavoritesBtn.addEventListener('click', () => {
        if (confirm('お気に入りをすべて削除しますか？')) {
          this.favorites = [];
          this.saveFavorites();
          this.renderFavoritesGrid();
          this.updateFavoriteIcons();
          this.showToast('お気に入りをすべて削除しました', 'info');
        }
      });
    }
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) this.closeSettings();
      });
    }

    if (this.notificationsCheckbox) {
      this.notificationsCheckbox.addEventListener('change', this.updateNotificationSetting.bind(this));
    }
    if (this.autoOpenCheckbox) {
      this.autoOpenCheckbox.addEventListener('change', this.updateAutoOpenSetting.bind(this));
    }

    // Mobile sidebar toggle (if exists)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
    }

    // Dashboard refresh button
    const dashboardRefreshBtn = document.querySelector('.dashboard-actions .p-button');
    if (dashboardRefreshBtn) {
      dashboardRefreshBtn.addEventListener('click', this.loadFiles.bind(this));
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
    
    // Image zoom modal events
    this.initImageZoom();
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.socket = new WebSocket(wsUrl);
    
    // Initialize Mermaid
    if (window.mermaid) {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        themeVariables: {
          primaryColor: '#16a34a', // green-600
          primaryTextColor: '#f0fdf4', // green-50
          primaryBorderColor: '#15803d', // green-700
          lineColor: '#22c55e', // green-500
          secondaryColor: '#166534', // green-800
          tertiaryColor: '#14532d' // green-900
        }
      });
    }
    
    this.socket.onopen = () => {
      this.updateStatus('connected');
      console.log('WebSocket connected - File monitor active');
    };
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };
    
    this.socket.onclose = () => {
      this.updateStatus('disconnected');
      console.log('WebSocket disconnected - File monitor stopped');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.initWebSocket();
      }, 3000);
    };
    
    this.socket.onerror = (error) => {
      this.updateStatus('error');
      console.error('WebSocket error:', error);
    };
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'file:added':
        this.showToast(`新規ファイル: ${message.data.fileName}`, 'success');
        this.addRecentActivity(`📄 Added: ${message.data.fileName}`, 'success');
        this.loadFiles();
        break;
      case 'file:changed':
        this.showToast(`更新されました: ${message.data.fileName}`, 'info');
        this.addRecentActivity(`✏️ Modified: ${message.data.fileName}`, 'info');
        this.loadFiles();
        if (this.currentFile && this.currentFile.path === message.data.path) {
          this.loadFile(this.currentFile.id);
        }
        break;
      case 'file:removed':
        this.showToast(`削除されました: ${message.data.fileName}`, 'warning');
        this.addRecentActivity(`🗑️ Removed: ${message.data.fileName}`, 'warning');
        this.loadFiles();
        break;
      case 'file-updated':
        this.handleFileUpdatedNotification(message.data);
        break;
      case 'error':
        this.showToast(`エラー: ${message.data.message}`, 'error');
        this.addRecentActivity(`❌ System error occurred`, 'error');
        break;
    }
  }

  handleFileUpdatedNotification(data) {
    const { filePath, editorId, lastModified } = data;
    
    // Don't show notifications for our own edits
    if (editorId === this.getEditorId()) {
      console.log('Ignoring own file update notification');
      return;
    }
    
    console.log('Received file update notification:', { filePath, editorId, lastModified });
    
    // Extract filename from path for display
    const fileName = filePath.split('/').pop() || filePath;
    
    // Show notification that someone else is editing
    this.showToast(`他のユーザーが編集中: ${fileName}`, 'info');
    this.addRecentActivity(`👥 External edit: ${fileName}`, 'info');
    
    // If this is the currently opened file, check if we need to handle conflicts
    if (this.currentFile && this.currentFile.path === filePath) {
      this.handleCurrentFileExternalUpdate(lastModified, fileName);
    }
  }

  handleCurrentFileExternalUpdate(newLastModified, fileName) {
    // If we're currently in edit mode and have unsaved changes, warn about potential conflict
    if (this.editModeToggle && this.editModeToggle.isEditMode && this.hasUnsavedChanges) {
      this.showToast(`警告: ${fileName} が他のユーザーによって変更されました。保存時に競合が発生する可能性があります。`, 'warning');
      
      // Update the save status to show potential conflict
      if (this.editModeToggle) {
        this.editModeToggle.updateSaveStatus('conflict');
      }
      
      // Update our file's lastModified so we can detect the conflict on save
      if (this.currentFile) {
        this.currentFile.lastModified = newLastModified;
      }
    } else {
      // If we're not editing or have no unsaved changes, reload the file
      this.showToast(`${fileName} が更新されました。最新版を表示しています。`, 'info');
      this.loadFile(this.currentFile.id);
    }
  }

  async loadFiles() {
    try {
      console.log('Loading files from API...');
      const response = await fetch('/api/files');
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (result.success) {
        this.files = result.data;
        console.log('Files loaded:', this.files);
        this.renderFileTree();
        this.updateStats();
        // Update dashboard if it's currently visible
        if (!this.welcomeScreen.classList.contains('hidden')) {
          this.renderFileCards();
        }
      } else {
        console.error('API error:', result.error);
        this.showToast(`ファイル読み込みエラー: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Load files error:', error);
      this.showToast(`ファイル読み込み失敗: ${error.message}`, 'error');
    }
  }

  renderFileTree() {
    console.log('Rendering file tree with files:', this.files);
    const dates = Object.keys(this.files).sort().reverse();
    console.log('Dates found:', dates);
    
    // Get fresh reference to file tree element
    const fileTreeElement = document.getElementById('file-tree');
    console.log('File tree element in renderFileTree:', fileTreeElement);
    
    if (dates.length === 0) {
      console.log('No dates found, showing empty state');
      fileTreeElement.innerHTML = `
        <div class="text-center py-8">
          <i class="pi pi-folder-open text-3xl text-surface-400 mb-3"></i>
          <p class="text-surface-500 text-sm">No files found</p>
        </div>
      `;
      return;
    }

    let html = '';
    dates.forEach(date => {
      const files = this.files[date];
      html += `
        <div class="file-tree-item" data-date-group="${date}">
          <div class="file-tree-header" onclick="app.toggleDateGroup('${date}')">
            <i class="pi pi-folder folder-icon collapsed mr-2 text-primary" data-date="${date}"></i>
            <span class="flex-1 font-medium">${date}</span>
            <span class="text-xs text-surface-500 mr-2">${files.length} files</span>
            <i class="pi pi-chevron-right toggle-icon collapsed" data-date="${date}"></i>
          </div>
          <div class="file-tree-content collapsed" data-date="${date}">
            ${files.map(file => `
              <div class="file-item" data-file-id="${this.encodeFileId(file.path)}">
                <i class="pi pi-file mr-3 text-surface-400" style="font-size: 0.875rem;"></i>
                <div class="flex-1 min-w-0">
                  <div class="file-name text-sm font-medium truncate" title="${file.fileName}">${file.fileName}</div>
                  <div class="text-xs text-surface-500 mt-0.5">${this.formatFileSize(file.size)} • ${this.formatDate(file.modified)}</div>
                </div>
                <div class="flex gap-1 ml-2 file-actions">
                  <button class="p-button p-button-sm p-button-text p-button-rounded favorite-btn" data-file-path="${file.path}" title="Toggle favorite">
                    <i class="pi pi-star ${this.isFavorite(file.path) ? 'favorited' : ''}" style="font-size: 0.75rem;"></i>
                  </button>
                  <button class="p-button p-button-sm p-button-text p-button-rounded copy-path-btn" data-file-path="${file.path}" title="Copy path">
                    <i class="pi pi-copy" style="font-size: 0.75rem;"></i>
                  </button>
                  <button class="p-button p-button-sm p-button-text p-button-rounded delete-file-btn" data-file-id="${this.encodeFileId(file.path)}" data-file-name="${file.fileName}" title="Delete file">
                    <i class="pi pi-trash" style="font-size: 0.75rem;"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    console.log('Setting file tree HTML:', html.length, 'characters');
    fileTreeElement.innerHTML = html;
    
    // Files menu icon stays as pi-folder-open always
    
    console.log('File tree HTML set, attaching event listeners');
    this.attachFileItemEventListeners();
  }

  attachFileItemEventListeners() {
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
      const fileId = item.getAttribute('data-file-id');
      if (fileId) {
        item.addEventListener('click', (event) => {
          // Don't select file if action buttons were clicked
          if (event.target.closest('.copy-path-btn') || event.target.closest('.delete-file-btn') || event.target.closest('.favorite-btn')) {
            return;
          }
          event.preventDefault();
          this.selectFile(fileId, item);
        });
        // Remove this line since we set cursor in HTML now
      }
    });

    // Add favorite button event listeners
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const filePath = button.getAttribute('data-file-path');
        this.toggleFavorite(filePath);
      });
    });

    // Add copy button event listeners
    const copyButtons = document.querySelectorAll('.copy-path-btn');
    copyButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const filePath = button.getAttribute('data-file-path');
        this.copyToClipboard(filePath);
      });
    });

    // Add delete button event listeners
    const deleteButtons = document.querySelectorAll('.delete-file-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const fileId = button.getAttribute('data-file-id');
        const fileName = button.getAttribute('data-file-name');
        this.deleteFile(fileId, fileName);
      });
    });
  }

  toggleDateGroup(date) {
    const fileList = document.querySelector(`[data-date="${date}"].file-tree-content`);
    const chevron = document.querySelector(`.toggle-icon[data-date="${date}"]`);
    const folderIcon = document.querySelector(`.folder-icon[data-date="${date}"]`);
    
    if (fileList.classList.contains('collapsed')) {
      // 展開
      fileList.classList.remove('collapsed');
      fileList.classList.add('expanded');
      chevron.classList.remove('collapsed');
      chevron.classList.add('expanded');
      folderIcon.classList.remove('collapsed');
      folderIcon.classList.add('expanded');
      
      // Change folder icon to folder-open when expanded
      folderIcon.classList.remove('pi-folder');
      folderIcon.classList.add('pi-folder-open');
      
      // Files menu icon stays as pi-folder-open always
    } else {
      // 収納
      fileList.classList.remove('expanded');
      fileList.classList.add('collapsed');
      chevron.classList.remove('expanded');
      chevron.classList.add('collapsed');
      folderIcon.classList.remove('expanded');
      folderIcon.classList.add('collapsed');
      
      // Change folder-open icon back to folder when collapsed
      folderIcon.classList.remove('pi-folder-open');
      folderIcon.classList.add('pi-folder');
      
      // Files menu icon stays as pi-folder-open always
    }
  }

  async selectFile(fileId, clickedElement = null) {
    try {
      console.log('Selecting file with ID:', fileId);
      const response = await fetch(`/api/file/${fileId}`);
      const result = await response.json();
      
      if (result.success) {
        this.currentFile = { ...result.data, id: fileId };
        this.renderFile();
        
        // Update view mode switch
        if (this.viewModeToggle) {
          this.viewModeToggle.checked = this.isRawView;
        }
        
        // Show view mode switch in header
        if (this.viewModeSwitch) {
          this.viewModeSwitch.classList.remove('hidden');
        }
        
        // Files icon is controlled by directory expansion state, not file selection
        
        // Set Files as active menu item when file is selected from sidebar
        this.setActiveMenuItem(this.filesButton);
        this.updateFilesMenuIcon(true);
        
        // Update active state
        document.querySelectorAll('.file-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        if (clickedElement) {
          clickedElement.classList.add('selected');
        }
        
        // Update edit mode toggle state
        if (this.editModeToggle) {
          this.editModeToggle.updateFileState(this.currentFile);
        }
      } else {
        this.showToast(`ファイル読み込みエラー: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('File selection error:', error);
      this.showToast(`ファイル読み込み失敗: ${error.message}`, 'error');
    }
  }

  renderFile() {
    if (!this.currentFile) return;

    this.welcomeScreen.classList.add('hidden');
    this.fileViewer.classList.remove('hidden');

    // Update header
    this.fileTitle.textContent = this.currentFile.fileName;
    
    // Update meta
    document.getElementById('file-size').textContent = this.formatFileSize(this.currentFile.size);
    document.getElementById('file-modified').textContent = `Updated: ${this.formatDate(this.currentFile.modified)}`;

    // Update content
    if (this.isRawView) {
      this.rawContent.textContent = this.currentFile.fullContent;
      this.rawContent.classList.remove('hidden');
      this.markdownContent.classList.add('hidden');
    } else {
      if (this.currentFile.isMarkdown && this.currentFile.htmlContent) {
        this.markdownContent.innerHTML = this.currentFile.htmlContent;
        this.highlightCode();
        // Re-initialize image zoom after content is loaded
        this.attachImageZoomToContent();
      } else {
        this.markdownContent.innerHTML = `<pre>${this.escapeHtml(this.currentFile.fullContent)}</pre>`;
      }
      this.markdownContent.classList.remove('hidden');
      this.rawContent.classList.add('hidden');
    }
  }

  // toggleView method is no longer needed as view mode is controlled by the switch

  async handleSearch() {
    const query = this.searchInput.value.trim();
    
    if (!query) {
      // Reset dashboard title when clearing search
      const dashboardTitle = document.querySelector('.dashboard-title h1');
      if (dashboardTitle && !this.welcomeScreen.classList.contains('hidden')) {
        dashboardTitle.textContent = 'Recent Documents';
      }
      this.loadFiles(); // This will update both sidebar and dashboard
      return;
    }

    // Show searching state in dashboard if visible
    if (!this.welcomeScreen.classList.contains('hidden')) {
      const container = document.getElementById('file-cards-container');
      if (container) {
        container.innerHTML = `
          <div class="file-cards-loading">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <p>Searching for "${query}"...</p>
          </div>
        `;
      }
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        // Group search results by date
        const grouped = {};
        result.data.forEach(file => {
          const dateKey = file.dirName || 'root';
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(file);
        });
        
        this.files = grouped;
        this.renderFileTree();
        // Update dashboard cards if visible
        if (!this.welcomeScreen.classList.contains('hidden')) {
          this.renderFileCards();
        }
        // Update dashboard header to show search results
        const dashboardTitle = document.querySelector('.dashboard-title h1');
        if (dashboardTitle && !this.welcomeScreen.classList.contains('hidden')) {
          dashboardTitle.textContent = `Search Results for "${query}"`;
        }
        this.showToast(`${result.data.length}件の結果が見つかりました`, 'info');
      } else {
        this.showToast(`検索エラー: ${result.error}`, 'error');
      }
    } catch (error) {
      this.showToast(`検索失敗: ${error.message}`, 'error');
    }
  }

  highlightCode() {
    // Highlight code blocks using Prism
    if (window.Prism) {
      Prism.highlightAllUnder(this.markdownContent);
    }
    
    // Render Mermaid diagrams
    this.renderMermaidDiagrams();
    
    // Add copy functionality to tables
    this.addTableCopyFunctionality();
  }

  async renderMermaidDiagrams() {
    if (!window.mermaid) return;
    
    const mermaidElements = this.markdownContent.querySelectorAll('pre code.language-mermaid, code.language-mermaid');
    
    for (let i = 0; i < mermaidElements.length; i++) {
      const element = mermaidElements[i];
      const mermaidCode = element.textContent || element.innerText;
      
      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, mermaidCode);
        
        // Create container div
        const container = document.createElement('div');
        container.className = 'mermaid-diagram bg-gradient-to-br from-green-900 to-green-800/30 p-6 rounded-2xl border border-green-600/50 shadow-lg mb-6 overflow-x-auto backdrop-blur-sm';
        container.innerHTML = svg;
        
        // Replace the code block with the rendered diagram
        const parent = element.closest('pre') || element;
        parent.parentNode.replaceChild(container, parent);
        
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // Keep the original code block if rendering fails
        element.className = 'language-text'; // Change to plain text to avoid re-processing
      }
    }
  }

  updateStats() {
    const totalFiles = Object.values(this.files).flat().length;
    const totalDates = Object.keys(this.files).length;
    
    // Animate numbers
    this.animateNumber(this.totalFiles, totalFiles);
    this.animateNumber(this.totalDates, totalDates);
  }
  
  animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = Math.abs(targetValue - currentValue) * 50;
    
    if (currentValue === targetValue) return;
    
    const step = () => {
      const current = parseInt(element.textContent) || 0;
      if (current !== targetValue) {
        element.textContent = current + increment;
        setTimeout(step, duration / Math.abs(targetValue - currentValue));
      }
    };
    
    step();
  }

  updateStatus(status, text) {
    // Update status dot classes
    this.statusDot.className = 'status-dot';
    const statusSubtitle = document.getElementById('status-subtitle');
    
    if (status === 'connected') {
      // Default green pulse animation (already set in CSS)
      this.statusText.textContent = 'ファイル監視中';
      if (statusSubtitle) {
        statusSubtitle.textContent = '新しいドキュメントを監視しています';
      }
    } else if (status === 'disconnected') {
      this.statusDot.classList.add('disconnected');
      this.statusText.textContent = '接続が切断されました';
      if (statusSubtitle) {
        statusSubtitle.textContent = '再接続を試行中...';
      }
    } else if (status === 'error') {
      this.statusDot.classList.add('error');
      this.statusText.textContent = '接続エラー';
      if (statusSubtitle) {
        statusSubtitle.textContent = 'サーバーの状態を確認してください';
      }
    } else {
      this.statusText.textContent = '初期化中';
      if (statusSubtitle) {
        statusSubtitle.textContent = 'ファイル監視を開始しています...';
      }
    }
  }

  openSettings() {
    this.settingsModal.style.display = 'flex';
  }

  closeSettings() {
    this.settingsModal.style.display = 'none';
  }

  async updateNotificationSetting() {
    try {
      await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: this.notificationsCheckbox.checked })
      });
    } catch (error) {
      this.showToast('通知設定の更新に失敗しました', 'error');
    }
  }

  async updateAutoOpenSetting() {
    try {
      await fetch('/api/settings/auto-open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: this.autoOpenCheckbox.checked })
      });
    } catch (error) {
      this.showToast('自動起動設定の更新に失敗しました', 'error');
    }
  }

  toggleSidebar() {
    // Toggle mobile sidebar
    if (window.innerWidth < 992) {
      this.sidebar.classList.toggle('active');
    }
  }

  openSidebar() {
    if (window.innerWidth < 992) {
      this.sidebar.classList.add('active');
    }
  }

  closeSidebar() {
    if (window.innerWidth < 992) {
      this.sidebar.classList.remove('active');
    }
  }

  handleKeyboard(event) {
    // Ctrl/Cmd + F for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      this.searchInput.focus();
    }
    
    // Escape to close modals and sidebar
    if (event.key === 'Escape') {
      this.closeSettings();
      this.closeSidebar();
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    
    let toastClass = 'p-toast-message p-toast-message-info';
    let iconClass = 'pi pi-info-circle';
    
    if (type === 'success') {
      toastClass = 'p-toast-message p-toast-message-success';
      iconClass = 'pi pi-check';
    } else if (type === 'warning') {
      toastClass = 'p-toast-message p-toast-message-warn';
      iconClass = 'pi pi-exclamation-triangle';
    } else if (type === 'error') {
      toastClass = 'p-toast-message p-toast-message-error';
      iconClass = 'pi pi-times';
    }
    
    toast.className = `${toastClass} p-toast-message-enter-done`;
    toast.innerHTML = `
      <div class="p-toast-message-content">
        <i class="${iconClass} p-toast-message-icon"></i>
        <div class="p-toast-message-text">
          <span class="p-toast-summary">${message}</span>
        </div>
        <button class="p-toast-icon-close p-link" onclick="this.parentElement.parentElement.remove()">
          <i class="pi pi-times p-toast-icon-close-icon"></i>
        </button>
      </div>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Auto remove toast after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  }

  // Utility methods
  encodeFileId(path) {
    // Simple Base64 encoding for UTF-8 strings
    return btoa(encodeURIComponent(path));
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async copyToClipboard(text) {
    // Get the button that was clicked for visual feedback
    const activeButton = document.querySelector('.copy-path-btn:active') || 
                        event.target.closest('.copy-path-btn');
    
    if (activeButton) {
      // Add immediate visual feedback
      activeButton.style.transform = 'scale(0.9)';
      activeButton.style.backgroundColor = 'rgb(34 197 94 / 0.9)'; // green-500
      
      // Reset after 150ms
      setTimeout(() => {
        activeButton.style.transform = '';
        activeButton.style.backgroundColor = '';
      }, 150);
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showToast('📋 パスをコピーしました！', 'success');
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Clipboard API failed, trying fallback:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.showToast('📋 パスをコピーしました！', 'success');
          console.log('Copied via execCommand:', text);
        } else {
          throw new Error('execCommand copy failed');
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        this.showToast('❌ コピーに失敗しました', 'error');
      }
      document.body.removeChild(textArea);
    }
  }

  async deleteFile(fileId, fileName) {
    // Confirmation dialog
    const confirmDelete = confirm(`ファイル「${fileName}」を削除しますか？\n\nこの操作は取り消せません。`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/file/${fileId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(`🗑️ ファイルを削除しました: ${fileName}`, 'success');
        this.addRecentActivity(`🗑️ Deleted: ${fileName}`, 'warning');
        
        // If currently viewing this file, show welcome screen
        if (this.currentFile && this.currentFile.id === fileId) {
          this.currentFile = null;
          this.welcomeScreen.classList.remove('hidden');
          this.fileViewer.classList.add('hidden');
        }
        
        // Refresh file list
        this.loadFiles();
      } else {
        this.showToast(`❌ 削除に失敗しました: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Delete file error:', error);
      this.showToast(`❌ 削除に失敗しました: ${error.message}`, 'error');
    }
  }

  initDashboard() {
    // Update uptime every second
    setInterval(() => {
      const uptime = Date.now() - this.startTime;
      const hours = Math.floor(uptime / (1000 * 60 * 60));
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
      
      const uptimeElement = document.getElementById('uptime-info');
      if (uptimeElement) {
        uptimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  initEditMode() {
    try {
      this.editModeToggle = new EditModeToggle(this);
    } catch (error) {
      console.error('Failed to initialize edit mode:', error);
    }
  }

  enterEditMode() {
    console.log('Entering edit mode for file:', this.currentFile?.fileName);
    
    if (!this.currentFile) {
      console.error('No file selected for editing');
      return;
    }
    
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) {
      console.error('Editor container not found');
      return;
    }
    
    try {
      // テキストエディタを初期化
      this.textEditor = new TextEditor(editorContainer, this);
      
      // 自動保存マネージャーを初期化
      this.autoSaveManager = new AutoSaveManager(this, this.textEditor);
      
      // エディタにフォーカス
      setTimeout(() => {
        if (this.textEditor) {
          this.textEditor.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to initialize text editor:', error);
      this.showToast('エディタの初期化に失敗しました', 'error');
    }
  }

  exitEditMode() {
    console.log('Exiting edit mode');
    
    // 自動保存マネージャーを破棄
    if (this.autoSaveManager) {
      try {
        this.autoSaveManager.destroy();
        this.autoSaveManager = null;
      } catch (error) {
        console.error('Failed to destroy auto-save manager:', error);
      }
    }
    
    if (this.textEditor) {
      try {
        // エディタを破棄
        this.textEditor.destroy();
        this.textEditor = null;
      } catch (error) {
        console.error('Failed to destroy text editor:', error);
      }
    }
  }

  // エディタからのコールバック
  onContentChange(content) {
    this.markAsModified();
    
    // 自動保存マネージャーに変更を通知
    if (this.autoSaveManager) {
      this.autoSaveManager.onContentChange();
    }
    
    console.log('Content changed, length:', content.length);
  }

  // ファイル保存
  async saveFile(content) {
    console.log('Saving file:', this.currentFile?.fileName);
    
    // バリデーション
    if (!this.currentFile) {
      const error = { success: false, error: 'NO_FILE' };
      this.showToast('保存するファイルが選択されていません', 'error');
      return error;
    }
    
    if (this.currentFile.readOnly) {
      const error = { success: false, error: 'READ_ONLY' };
      this.showToast('読み取り専用ファイルは保存できません', 'error');
      return error;
    }
    
    // 保存状態の更新
    if (this.editModeToggle) {
      this.editModeToggle.updateSaveStatus('saving');
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
        // ファイル情報の更新
        this.currentFile.lastModified = result.data.lastModified;
        this.currentFile.fullContent = content;
        this.hasUnsavedChanges = false;
        
        // UI状態の更新
        if (this.editModeToggle) {
          this.editModeToggle.updateSaveStatus('saved');
        }
        
        // 自動保存マネージャーに手動保存を通知
        if (this.autoSaveManager) {
          this.autoSaveManager.onManualSave();
        }
        
        this.showToast('ファイルを保存しました', 'success');
        
        return { success: true, data: result.data };
      } else {
        // エラー処理
        if (result.error === 'CONFLICT_DETECTED') {
          if (this.editModeToggle) {
            this.editModeToggle.updateSaveStatus('conflict');
          }
          this.showToast('ファイル競合が検出されました', 'warning');
          return { success: false, error: result.error, data: result.data };
        } else {
          if (this.editModeToggle) {
            this.editModeToggle.updateSaveStatus('error');
          }
          this.showToast(`保存に失敗しました: ${result.error}`, 'error');
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      
      if (this.editModeToggle) {
        this.editModeToggle.updateSaveStatus('error');
      }
      this.showToast(`保存に失敗しました: ${error.message}`, 'error');
      
      return { success: false, error: error.message };
    }
  }

  // エディタID管理
  generateEditorId() {
    return 'editor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getEditorId() {
    if (!this.editorId) {
      this.editorId = this.generateEditorId();
    }
    return this.editorId;
  }

  // ファイル状態管理
  markAsModified() {
    this.hasUnsavedChanges = true;
  }

  showDashboard() {
    this.currentFile = null;
    this.welcomeScreen.classList.remove('hidden');
    this.filesView.classList.add('hidden');
    this.favoritesView.classList.add('hidden');
    this.fileViewer.classList.add('hidden');
    this.setActiveMenuItem(this.dashboardButton);
    
    // Hide view mode switch in header
    if (this.viewModeSwitch) {
      this.viewModeSwitch.classList.add('hidden');
    }
    
    // Close all sidebar directories when Dashboard is selected
    this.closeAllSidebarDirectories();
    
    // Reset Files menu icon to inactive state
    this.updateFilesMenuIcon(false);
    
    this.renderFileCards();
  }
  
  showSidebarDirectories() {
    // Animate directories appearing one by one
    const directories = document.querySelectorAll('.file-tree-item');
    directories.forEach((dir, index) => {
      // Remove any existing animation classes first
      dir.classList.remove('animate-out');
      
      setTimeout(() => {
        dir.classList.add('animate-in');
      }, index * 150); // 150ms delay between each directory
    });
  }
  
  closeAllSidebarDirectories() {
    // Find all directories and close them with animation
    const directories = document.querySelectorAll('.file-tree-item');
    
    directories.forEach((dir, index) => {
      setTimeout(() => {
        dir.classList.remove('animate-in');
        dir.classList.add('animate-out');
        
        // Also close expanded directories  
        const date = dir.getAttribute('data-date-group');
        if (date) {
          const fileList = document.querySelector(`[data-date="${date}"].file-tree-content`);
          const chevron = document.querySelector(`.toggle-icon[data-date="${date}"]`);
          const folderIcon = document.querySelector(`.folder-icon[data-date="${date}"]`);
          
          if (fileList && fileList.classList.contains('expanded')) {
            fileList.classList.remove('expanded');
            fileList.classList.add('collapsed');
          }
          
          if (chevron) {
            chevron.classList.remove('expanded');
            chevron.classList.add('collapsed');
            chevron.classList.remove('pi-chevron-down');
            chevron.classList.add('pi-chevron-right');
          }
          
          if (folderIcon) {
            folderIcon.classList.remove('expanded');
            folderIcon.classList.add('collapsed');
            folderIcon.classList.remove('pi-folder-open');
            folderIcon.classList.add('pi-folder');
          }
        }
      }, index * 100); // 100ms delay between each directory disappearing
    });
  }
  
  updateFilesMenuIcon(active = false) {
    const filesMenuIcon = this.filesButton?.querySelector('.layout-menuitem-icon');
    if (filesMenuIcon) {
      if (active) {
        // Change to folder-open when Files is active/selected
        filesMenuIcon.classList.remove('pi-folder');
        filesMenuIcon.classList.add('pi-folder-open');
      } else {
        // Change back to folder when inactive
        filesMenuIcon.classList.remove('pi-folder-open');
        filesMenuIcon.classList.add('pi-folder');
      }
    }
  }
  
  showFilesView() {
    this.currentFile = null;
    this.welcomeScreen.classList.add('hidden');
    this.filesView.classList.remove('hidden');
    this.favoritesView.classList.add('hidden');
    this.fileViewer.classList.add('hidden');
    this.setActiveMenuItem(this.filesButton);
    
    // Hide view mode switch in header
    if (this.viewModeSwitch) {
      this.viewModeSwitch.classList.add('hidden');
    }
    
    // Files icon is controlled by directory expansion state
    
    this.renderFilesGrid();
  }
  
  showFavoritesView() {
    this.currentFile = null;
    this.welcomeScreen.classList.add('hidden');
    this.filesView.classList.add('hidden');
    this.favoritesView.classList.remove('hidden');
    this.fileViewer.classList.add('hidden');
    this.setActiveMenuItem(this.favoritesButton);
    
    // Hide view mode switch in header
    if (this.viewModeSwitch) {
      this.viewModeSwitch.classList.add('hidden');
    }
    
    // Reset Files menu icon
    this.updateFilesMenuIcon(false);
    
    // Close all sidebar directories when switching to Favorites
    this.closeAllSidebarDirectories();
    
    this.renderFavoritesGrid();
  }
  
  // Favorites localStorage management
  loadFavorites() {
    try {
      const stored = localStorage.getItem('claude-outputs-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }
  
  saveFavorites() {
    try {
      localStorage.setItem('claude-outputs-favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }
  
  toggleFavorite(filePath) {
    const index = this.favorites.findIndex(fav => fav.path === filePath);
    if (index > -1) {
      // Remove from favorites
      this.favorites.splice(index, 1);
      this.showToast('ファイルをお気に入りから削除しました', 'info');
    } else {
      // Add to favorites
      const fileData = this.findFileByPath(filePath);
      if (fileData) {
        // Find the date from the files structure
        let fileDate = null;
        Object.entries(this.files).forEach(([date, dateFiles]) => {
          dateFiles.forEach(file => {
            if (file.path === filePath) {
              fileDate = date;
            }
          });
        });
        
        this.favorites.push({
          path: filePath,
          fileName: fileData.fileName,
          date: fileDate || this.formatDate(fileData.modified),
          modified: fileData.modified,
          size: fileData.size,
          addedAt: new Date().toISOString()
        });
        this.showToast('ファイルをお気に入りに追加しました', 'success');
      }
    }
    this.saveFavorites();
    
    // Update star icons throughout the UI
    this.updateFavoriteIcons();
    
    // Refresh favorites view if currently visible
    if (!this.favoritesView.classList.contains('hidden')) {
      this.renderFavoritesGrid();
    }
  }
  
  isFavorite(filePath) {
    return this.favorites.some(fav => fav.path === filePath);
  }
  
  findFileByPath(filePath) {
    let found = null;
    Object.values(this.files).forEach(dateFiles => {
      dateFiles.forEach(file => {
        if (file.path === filePath) {
          found = file;
        }
      });
    });
    return found;
  }
  
  updateFavoriteIcons() {
    // Update icons in file cards and grid items
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      const filePath = btn.getAttribute('data-file-path');
      const icon = btn.querySelector('i');
      if (this.isFavorite(filePath)) {
        icon.classList.add('favorited');
        btn.classList.add('favorited');
      } else {
        icon.classList.remove('favorited');
        btn.classList.remove('favorited');
      }
    });
  }
  
  renderFavoritesGrid() {
    const container = document.getElementById('favorites-grid-container');
    if (!container) return;
    
    if (this.favorites.length === 0) {
      container.innerHTML = `
        <div class="favorites-empty">
          <i class="pi pi-star text-3xl text-surface-400 mb-3"></i>
          <p>No favorite files yet</p>
          <p class="text-sm text-surface-500">Star files to add them to your favorites</p>
        </div>
      `;
      return;
    }
    
    // Sort favorites by date added (newest first)
    const sortedFavorites = [...this.favorites].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    
    const html = sortedFavorites.map(favorite => {
      const relativeTime = this.getRelativeTime(favorite.modified);
      const fileData = this.findFileByPath(favorite.path);
      const excerpt = fileData ? this.extractExcerpt(fileData.content || '') : 'No preview available';
      const fileType = favorite.fileName.split('.').pop()?.toUpperCase() || 'FILE';
      
      return `
        <div class="file-card favorite-item" onclick="app.selectFile('${this.encodeFileId(favorite.path)}')">
          <div class="file-card-header">
            <h3 class="file-card-title">${favorite.fileName}</h3>
            <div class="file-card-meta">
              <span><i class="pi pi-calendar"></i> ${favorite.date}</span>
              <span><i class="pi pi-clock"></i> ${relativeTime}</span>
              <span class="file-card-type">${fileType}</span>
            </div>
          </div>
          <div class="file-card-content">
            <p class="file-card-excerpt">${excerpt}</p>
            <div class="file-card-footer">
              <span class="file-card-date">${this.formatFileSize(favorite.size)}</span>
              <div class="file-card-actions">
                <button class="p-button p-button-text p-button-sm p-button-rounded favorite-btn" onclick="event.stopPropagation(); app.toggleFavorite('${favorite.path}')" data-file-path="${favorite.path}" title="Toggle favorite">
                  <i class="pi pi-star favorited"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-rounded" onclick="event.stopPropagation(); app.copyToClipboard('${favorite.path}')" title="Copy path">
                  <i class="pi pi-copy"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-rounded" onclick="event.stopPropagation(); app.deleteFile('${this.encodeFileId(favorite.path)}', '${favorite.fileName}')" title="Delete">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  }
  
  // Image Zoom Modal Implementation
  initImageZoom() {
    // Initialize modal controls only once
    console.log('Initializing image zoom modal controls...');
    
    // Attach initial image click handlers
    this.attachImageZoomToContent();
    
    // Modal controls
    document.getElementById('zoom-close-btn')?.addEventListener('click', () => this.closeImageZoom());
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('zoom-reset-btn')?.addEventListener('click', () => this.resetZoom());
    document.getElementById('zoom-fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    
    // Backdrop click to close
    document.querySelector('.image-zoom-backdrop')?.addEventListener('click', () => this.closeImageZoom());
    
    // Pan and zoom events
    this.zoomWrapper?.addEventListener('mousedown', this.startPan.bind(this));
    document.addEventListener('mousemove', this.updatePan.bind(this));
    document.addEventListener('mouseup', this.endPan.bind(this));
    this.zoomWrapper?.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    this.zoomWrapper?.addEventListener('dblclick', this.fitToScreen.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleZoomKeyboard.bind(this));
  }
  
  attachImageZoomToContent() {
    // Attach click handlers to images in markdown content
    const markdownContent = document.getElementById('markdown-content');
    if (!markdownContent) {
      return;
    }
    
    // Find all images and SVGs in the markdown content
    const images = markdownContent.querySelectorAll('img, svg');
    console.log(`🖼️ Found ${images.length} images/SVGs, attaching zoom handlers`);
    
    images.forEach((img, index) => {
      // Make image clickable
      img.style.cursor = 'pointer';
      img.style.transition = 'opacity 0.2s ease';
      
      // Add hover effect
      img.addEventListener('mouseenter', () => {
        img.style.opacity = '0.8';
      });
      
      img.addEventListener('mouseleave', () => {
        img.style.opacity = '1';
      });
      
      // Add click handler
      img.addEventListener('click', (e) => {
        console.log('🔍 Image clicked, opening zoom modal');
        e.preventDefault();
        e.stopPropagation();
        this.openImageZoom(img);
      });
    });
  }
  
  openImageZoom(imgElement) {
    if (!imgElement.src || !this.imageZoomModal) {
      console.error('❌ Cannot open image zoom: missing image src or modal element');
      return;
    }
    
    console.log('🚀 Opening image zoom modal');
    
    // Set image
    this.zoomImage.src = imgElement.src;
    this.zoomImage.alt = imgElement.alt || 'Image';
    this.zoomTitle.textContent = imgElement.alt || 'Image';
    
    // Reset zoom state
    this.currentZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomTransform();
    
    // Show modal with animation
    this.imageZoomModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.imageZoomModal.classList.add('show');
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      this.zoomSize.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      this.fitToScreen();
    };
    img.src = imgElement.src;
  }
  
  closeImageZoom() {
    this.imageZoomModal.classList.remove('show');
    setTimeout(() => {
      this.imageZoomModal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
  
  zoomIn() {
    this.currentZoom = Math.min(this.currentZoom * 1.5, 10);
    this.updateZoomTransform();
  }
  
  zoomOut() {
    this.currentZoom = Math.max(this.currentZoom / 1.5, 0.1);
    this.updateZoomTransform();
  }
  
  resetZoom() {
    this.currentZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomTransform();
  }
  
  fitToScreen() {
    const wrapper = this.zoomWrapper;
    const img = this.zoomImage;
    
    if (!wrapper || !img) return;
    
    const wrapperRect = wrapper.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    const scaleX = wrapperRect.width / img.naturalWidth;
    const scaleY = wrapperRect.height / img.naturalHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    this.currentZoom = scale;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomTransform();
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.imageZoomModal.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
  
  startPan(e) {
    if (this.currentZoom <= 1) return;
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.zoomWrapper.classList.add('dragging');
  }
  
  updatePan(e) {
    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;
    
    this.panX += deltaX;
    this.panY += deltaY;
    
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    
    this.updateZoomTransform();
  }
  
  endPan() {
    this.isDragging = false;
    this.zoomWrapper?.classList.remove('dragging');
  }
  
  handleWheel(e) {
    e.preventDefault();
    
    const rect = this.zoomWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * 0.1);
    const newZoom = Math.min(Math.max(this.currentZoom * zoom, 0.1), 10);
    
    if (newZoom !== this.currentZoom) {
      const factor = newZoom / this.currentZoom;
      this.panX = mouseX - factor * (mouseX - this.panX);
      this.panY = mouseY - factor * (mouseY - this.panY);
      this.currentZoom = newZoom;
      this.updateZoomTransform();
    }
  }
  
  handleZoomKeyboard(e) {
    if (!this.imageZoomModal.classList.contains('show')) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeImageZoom();
        break;
      case '+':
      case '=':
        e.preventDefault();
        this.zoomIn();
        break;
      case '-':
        e.preventDefault();
        this.zoomOut();
        break;
      case '0':
        e.preventDefault();
        this.resetZoom();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        this.toggleFullscreen();
        break;
    }
  }
  
  updateZoomTransform() {
    if (!this.zoomImage) return;
    
    this.zoomImage.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
    this.zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
  }

  renderFilesGrid() {
    // Show directory list by default
    this.renderDirectoryList();
  }
  
  renderDirectoryList() {
    const container = document.getElementById('files-grid-container');
    if (!container) return;
    
    const allFiles = [];
    const directories = new Set();
    
    Object.entries(this.files).forEach(([date, files]) => {
      files.forEach(file => {
        allFiles.push({ ...file, date });
        // Extract directory info
        if (file.dirName && file.dirName !== '.') {
          directories.add(file.dirName);
        }
      });
    });
    
    if (allFiles.length === 0) {
      container.innerHTML = `
        <div class="files-loading">
          <i class="pi pi-folder-open text-3xl text-surface-400 mb-3"></i>
          <p>No directories found</p>
        </div>
      `;
      return;
    }
    
    // Group files by directory to get file counts
    const filesByDirectory = {};
    allFiles.forEach(file => {
      const dir = file.dirName || 'Root';
      if (!filesByDirectory[dir]) {
        filesByDirectory[dir] = [];
      }
      filesByDirectory[dir].push(file);
    });
    
    // Render directory list only
    const html = Object.entries(filesByDirectory).map(([dirName, files]) => {
      const isRoot = dirName === 'Root';
      const dirDisplayName = isRoot ? 'Root Directory' : dirName;
      const latestFile = files.sort((a, b) => new Date(b.modified) - new Date(a.modified))[0];
      const relativeTime = this.getRelativeTime(latestFile.modified);
      
      return `
        <div class="directory-card" onclick="app.selectDirectory('${dirName}')">
          <div class="directory-card-header">
            <div class="directory-card-icon">
              <i class="pi pi-folder"></i>
            </div>
            <div class="directory-card-info">
              <h3>${dirDisplayName}</h3>
              <p>${files.length} files</p>
            </div>
          </div>
          <div class="directory-card-content">
            <div class="directory-card-meta">
              <span>Last modified: ${relativeTime}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  }
  
  selectDirectory(dirName) {
    // Show files in selected directory
    this.renderFilesInDirectory(dirName);
  }
  
  renderFilesInDirectory(dirName) {
    const container = document.getElementById('files-grid-container');
    if (!container) return;
    
    const allFiles = [];
    Object.entries(this.files).forEach(([date, files]) => {
      files.forEach(file => {
        const fileDir = file.dirName || 'Root';
        if (fileDir === dirName) {
          allFiles.push({ ...file, date });
        }
      });
    });
    
    // Sort by modified date, newest first
    allFiles.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    const isRoot = dirName === 'Root';
    const dirDisplayName = isRoot ? 'Root Directory' : dirName;
    
    let html = `
      <div class="directory-breadcrumb">
        <button class="breadcrumb-back" onclick="app.renderDirectoryList()">
          <i class="pi pi-arrow-left"></i> Back to Directories
        </button>
        <div class="breadcrumb-current">
          <i class="pi pi-folder-open"></i>
          <span>${dirDisplayName}</span>
        </div>
      </div>
      <div class="directory-files-grid">
    `;
    
    html += allFiles.map(file => {
      const relativeTime = this.getRelativeTime(file.modified);
      const excerpt = this.extractExcerpt(file.content || '');
      
      return `
        <div class="file-grid-item" onclick="app.selectFile('${this.encodeFileId(file.path)}')">
          <div class="file-grid-item-header">
            <div class="file-grid-item-icon">
              <i class="pi pi-file-edit"></i>
            </div>
            <div class="file-grid-item-info">
              <h3>${file.fileName}</h3>
              <p>${file.date}</p>
            </div>
            <div class="file-grid-item-actions">
              <button class="p-button p-button-text p-button-sm p-button-rounded favorite-btn" onclick="event.stopPropagation(); app.toggleFavorite('${file.path}')" data-file-path="${file.path}" title="Toggle favorite">
                <i class="pi pi-star ${this.isFavorite(file.path) ? 'favorited' : ''}" style="font-size: 0.875rem;"></i>
              </button>
            </div>
          </div>
          <div class="file-grid-item-content">
            <div class="file-grid-item-excerpt">${excerpt}</div>
            <div class="file-grid-item-meta">
              <span>${this.formatFileSize(file.size)}</span>
              <span>${relativeTime}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    html += '</div>';
    container.innerHTML = html;
  }

  renderFileCards() {
    const container = document.getElementById('file-cards-container');
    if (!container) return;

    const allFiles = [];
    Object.entries(this.files).forEach(([date, files]) => {
      files.forEach(file => {
        allFiles.push({ ...file, date });
      });
    });

    // Sort by modified date, newest first
    allFiles.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    if (allFiles.length === 0) {
      container.innerHTML = `
        <div class="file-cards-loading">
          <i class="pi pi-folder-open text-4xl"></i>
          <p>No documents found</p>
          <p class="text-sm opacity-75 mt-2">Documents will appear here when added to the watch directory</p>
        </div>
      `;
      return;
    }

    const cardsHtml = allFiles.slice(0, 12).map(file => {
      const excerpt = this.extractExcerpt(file.content);
      const fileType = file.fileName.split('.').pop()?.toUpperCase() || 'FILE';
      const relativeTime = this.getRelativeTime(file.modified);
      
      return `
        <div class="file-card" onclick="app.selectFile('${this.encodeFileId(file.path)}')">
          <div class="file-card-header">
            <h3 class="file-card-title">${file.fileName}</h3>
            <div class="file-card-meta">
              <span><i class="pi pi-calendar"></i> ${file.date}</span>
              <span><i class="pi pi-clock"></i> ${relativeTime}</span>
              <span class="file-card-type">${fileType}</span>
            </div>
          </div>
          <div class="file-card-content">
            <p class="file-card-excerpt">${excerpt}</p>
            <div class="file-card-footer">
              <span class="file-card-date">${this.formatFileSize(file.size)}</span>
              <div class="file-card-actions">
                <button class="p-button p-button-text p-button-sm p-button-rounded favorite-btn" onclick="event.stopPropagation(); app.toggleFavorite('${file.path}')" data-file-path="${file.path}" title="Toggle favorite">
                  <i class="pi pi-star ${this.isFavorite(file.path) ? 'favorited' : ''}"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-rounded" onclick="event.stopPropagation(); app.copyToClipboard('${file.path}')" title="Copy path">
                  <i class="pi pi-copy"></i>
                </button>
                <button class="p-button p-button-text p-button-sm p-button-rounded" onclick="event.stopPropagation(); app.deleteFile('${this.encodeFileId(file.path)}', '${file.fileName}')" title="Delete">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHtml;
  }

  extractExcerpt(content) {
    if (!content) return 'No preview available';
    
    // Remove markdown headers and formatting
    let excerpt = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\n\s*\n/g, ' ') // Replace multiple newlines with space
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();

    return excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;
  }

  getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString();
  }

  toggleSearchClearButton() {
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn && this.searchInput) {
      clearBtn.style.display = this.searchInput.value.trim() ? 'flex' : 'none';
    }
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.toggleSearchClearButton();
      this.handleSearch(); // This will reset to show all files
    }
  }
  
  setActiveMenuItem(activeElement) {
    // Remove active class from all menu items
    document.querySelectorAll('.layout-menuitem-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to clicked item
    if (activeElement) {
      activeElement.classList.add('active');
    }
  }

  addRecentActivity(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const activity = { message, type, timestamp };
    
    this.recentActivity.unshift(activity);
    if (this.recentActivity.length > 5) {
      this.recentActivity.pop();
    }
    
    this.updateRecentActivity();
  }

  updateRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    if (this.recentActivity.length === 0) {
      container.innerHTML = `
        <div class="activity-placeholder">
          <i class="pi pi-clock"></i>
          <span>Monitoring file system for changes...</span>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.recentActivity.map(activity => {
      const iconClass = {
        'info': 'info',
        'success': 'success', 
        'warning': 'warning',
        'error': 'warning'
      }[activity.type] || 'info';
      
      const iconName = {
        'info': 'pi-info-circle',
        'success': 'pi-check', 
        'warning': 'pi-exclamation-triangle',
        'error': 'pi-times'
      }[activity.type] || 'pi-info-circle';
      
      return `
        <div class="activity-item">
          <div class="activity-icon ${iconClass}">
            <i class="pi ${iconName}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${activity.message}</div>
            <div class="activity-time">${activity.timestamp}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  addTableCopyFunctionality() {
    const tables = this.markdownContent.querySelectorAll('table');
    
    tables.forEach((table, index) => {
      // Skip if already wrapped
      if (table.closest('.table-copy-container')) return;
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'table-copy-container';
      
      // Create copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'table-copy-btn';
      copyBtn.innerHTML = '<i class="pi pi-copy"></i>Copy Table';
      copyBtn.title = 'Copy table as TSV';
      
      // Add copy functionality
      copyBtn.addEventListener('click', () => this.copyTableToClipboard(table, copyBtn));
      
      // Wrap table and add button
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      wrapper.appendChild(copyBtn);
    });
  }

  async copyTableToClipboard(table, button) {
    try {
      // Extract table data as TSV (Tab Separated Values)
      const rows = table.querySelectorAll('tr');
      const tsvData = [];
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => 
          cell.textContent.trim().replace(/\t/g, ' ')
        );
        tsvData.push(rowData.join('\t'));
      });
      
      const tsvString = tsvData.join('\n');
      
      // Copy to clipboard using modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tsvString);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = tsvString;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      // Show success feedback
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="pi pi-check"></i>Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('copied');
      }, 2000);
      
      // Show toast notification
      this.showToast('テーブルがクリップボードにコピーされました', 'success');
      
    } catch (error) {
      console.error('Failed to copy table:', error);
      this.showToast('コピーに失敗しました', 'error');
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  try {
    window.app = new ClaudeOutputsViewer();
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded');
} else {
  console.log('Document already loaded, initializing immediately');
  if (!window.app) {
    try {
      window.app = new ClaudeOutputsViewer();
      console.log('Fallback app initialization successful');
    } catch (error) {
      console.error('Failed to initialize app via fallback:', error);
    }
  }
}