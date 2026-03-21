import React, { useState } from 'react'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import RoadmapPage from './pages/RoadmapPage'
import QuizPage from './pages/QuizPage'
import Navbar from './components/skillpath/Navbar'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [appState, setAppState] = useState({})

  const navigateTo = (page, data = null) => {
    if (data) {
      setAppState((prev) => ({ ...prev, [page]: data }))
    }
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-blue-500/30">
      <Navbar onNavigate={navigateTo} />

      <main className="pt-16 pb-20">
        {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentPage === 'upload' && <UploadPage onNavigate={navigateTo} />}
        {currentPage === 'quiz' && <QuizPage onNavigate={navigateTo} />}
        {currentPage === 'processing' && (
          <ProcessingPage
            onNavigate={navigateTo}
            requestData={appState.processing}
          />
        )}
        {currentPage === 'results' && (
          <ResultsPage
            onNavigate={navigateTo}
            resultData={appState.results}
          />
        )}
        {currentPage === 'roadmap' && (
          <RoadmapPage
            onNavigate={navigateTo}
            resultData={appState.roadmap || appState.results}  // ✅ fallback to results
          />
        )}
      </main>
    </div>
  )
}

export default App