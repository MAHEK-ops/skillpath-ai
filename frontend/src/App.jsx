import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import RoadmapPage from './pages/RoadmapPage'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  return (
    <div>
      {currentPage === 'landing' && (
        <LandingPage onNavigate={navigateTo} />
      )}
      {currentPage === 'upload' && (
        <UploadPage onNavigate={navigateTo} />
      )}
      {currentPage === 'processing' && (
        <ProcessingPage onNavigate={navigateTo} />
      )}
      {currentPage === 'results' && (
        <ResultsPage onNavigate={navigateTo} />
      )}
      {currentPage === 'roadmap' && (
        <RoadmapPage onNavigate={navigateTo} />
      )}
    </div>
  )
}

export default App