import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "swiper/swiper-bundle.css"
import "flatpickr/dist/flatpickr.css"
import App from "./App.tsx"
import { AppWrapper } from "./components/common/PageMeta.tsx"
import { ThemeProvider } from "./context/ThemeContext.tsx"
import { AuthProvider } from "./context/AuthContext.tsx"
import { SidebarProvider } from "./context/SidebarContext.tsx"
import { BrowserRouter as Router } from "react-router-dom"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router basename="/polly-by-polyoak/">
            <AppWrapper>
              <App />
            </AppWrapper>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

