import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

const DashboardTV = lazy(() => import('./pages/DashboardTV'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#2DD4BF] font-medium">Carregando...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/tv" element={<DashboardTV />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={<Navigate to="/tv" replace />} />
          <Route path="*" element={<Navigate to="/tv" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App