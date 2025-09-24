import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { DeepLinkProvider } from './contexts/DeepLinkContext'
import { Toaster } from 'sonner'
import { router } from './router'
import './index.css'

// Créer un client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Composant principal de l'application web
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DeepLinkProvider>
          <RouterProvider router={router} />
          <Toaster richColors />
        </DeepLinkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Rendre l'application
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
