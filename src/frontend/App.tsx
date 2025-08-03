import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { TooltipProvider } from './components/ui/tooltip'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { DirectoryLanding } from './pages/DirectoryLanding'
import { DirectoryView } from './pages/DirectoryView'
import { FileView } from './pages/FileView'
import { SearchPage } from './pages/SearchPage'
import { FavoritesPage } from './pages/FavoritesPage'

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/directories" element={<DirectoryLanding />} />
              <Route path="/directory/:directoryPath" element={<DirectoryView />} />
              <Route path="/file/:filePath" element={<FileView />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </Layout>
        </Router>
      </TooltipProvider>
    </AppProvider>
  )
}

export default App