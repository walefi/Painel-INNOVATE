import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardTV } from './pages/DashboardTV'
import { AdminPanel } from './pages/AdminPanel'

/**
 * Componente principal da aplicação
 * Configura as rotas do React Router
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota do Painel de TV */}
        <Route path="/tv" element={<DashboardTV />} />
        
        {/* Rota do Painel do Gerente */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Redireciona a raiz para o Painel de TV */}
        <Route path="/" element={<Navigate to="/tv" replace />} />
        
        {/* Rota curinga - redireciona para TV */}
        <Route path="*" element={<Navigate to="/tv" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App