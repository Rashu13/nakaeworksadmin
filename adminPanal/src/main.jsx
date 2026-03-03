import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import { FavoriteProvider } from './context/FavoriteContext'
import App from './App.jsx'
import './index.css'

import { NotificationProvider } from './context/NotificationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <NotificationProvider>
            <CartProvider>
              <FavoriteProvider>
                <App />
              </FavoriteProvider>
            </CartProvider>
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
