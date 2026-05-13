import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import router from './Router/router.jsx'
import { ToastContainer } from 'react-toastify'
import AuthProvider from './context/AuthProvider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
      <ToastContainer/>
    </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
