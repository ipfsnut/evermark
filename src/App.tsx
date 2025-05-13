// src/App.tsx
import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi";
import { Layout } from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import CreateEvermarkPage from "./pages/CreateEvermarkPage";
import MyEvermarksPage from "./pages/MyEvermarksPage";
import EvermarkDetailPage from "./pages/EvermarkDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Import test console for development
import TestConsole from "./components/testing/TestConsole";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <ErrorBoundary component="App">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary component="HomePage">
                    <HomePage />
                  </ErrorBoundary>
                } />
                <Route path="/create" element={
                  <ErrorBoundary component="CreateEvermarkPage">
                    <CreateEvermarkPage />
                  </ErrorBoundary>
                } />
                <Route path="/my-evermarks" element={
                  <ErrorBoundary component="MyEvermarksPage">
                    <MyEvermarksPage />
                  </ErrorBoundary>
                } />
                <Route path="/evermark/:id" element={
                  <ErrorBoundary component="EvermarkDetailPage">
                    <EvermarkDetailPage />
                  </ErrorBoundary>
                } />
                <Route path="/profile" element={
                  <ErrorBoundary component="ProfilePage">
                    <ProfilePage />
                  </ErrorBoundary>
                } />
              </Routes>
            </Layout>
            
            {/* Test Console - only shown in development */}
            {process.env.NODE_ENV === 'development' && <TestConsole />}
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;
