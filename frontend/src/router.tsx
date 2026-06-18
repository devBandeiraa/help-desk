import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { NewTicketPage } from './pages/tickets/NewTicketPage'
import { TicketDetailPage } from './pages/tickets/TicketDetailPage'
import { TicketsPage } from './pages/tickets/TicketsPage'

function protectedRoute(element: JSX.Element) {
  return <ProtectedRoute>{element}</ProtectedRoute>
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/dashboard', element: protectedRoute(<DashboardPage />) },
  { path: '/tickets', element: protectedRoute(<TicketsPage />) },
  { path: '/tickets/new', element: protectedRoute(<NewTicketPage />) },
  { path: '/tickets/:id', element: protectedRoute(<TicketDetailPage />) },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
