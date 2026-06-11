import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import { LanguageProvider } from './Context/LanguageContext.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </Provider>
)
