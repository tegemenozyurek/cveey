import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import PredictionResult from './pages/PredictionResult.jsx'
import History from './pages/History.jsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'result', element: <PredictionResult /> },
			{ path: 'history', element: <History /> },
		],
	},
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


