import { useState } from 'react'
import Navbar from './components/skillpath/Navbar'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import RoadmapPage from './pages/RoadmapPage'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  const navigateTo = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />
      <div style={{ paddingTop: '64px' }}>
        {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentPage === 'upload' && <UploadPage onNavigate={navigateTo} />}
        {currentPage === 'processing' && <ProcessingPage onNavigate={navigateTo} />}
        {currentPage === 'results' && <ResultsPage onNavigate={navigateTo} />}
        {currentPage === 'roadmap' && <RoadmapPage onNavigate={navigateTo} />}
      </div>
    </div>
  )
}

export default App