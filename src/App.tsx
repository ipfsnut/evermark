// src/App.tsx
import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi";
import { LibraryLayout } from "./components/layout/LibraryLayout";
import HomePage from "./pages/HomePage";
import CreateEvermarkPage from "./pages/CreateEvermarkPage";
import MyEvermarksPage from "./pages/MyEvermarksPage";
import EvermarkDetailPage from "./pages/EvermarkDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LeaderboardPage from "./pages/LeaderboardPage";

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
            <LibraryLayout>
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
                <Route path="/leaderboard" element={
                  <ErrorBoundary component="LeaderboardPage">
                    <LeaderboardPage />
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
                {/* Add a search route */}
                <Route path="/search" element={
                  <ErrorBoundary component="SearchPage">
                    <div className="py-12 text-center">
                      <h1 className="text-responsive-title text-ink-dark mb-4">Search Archives</h1>
                      <p className="text-ink-light font-serif text-lg">
                        Search functionality coming soon...
                      </p>
                    </div>
                  </ErrorBoundary>
                } />
              </Routes>
            </LibraryLayout>
            
            {/* Test Console - only shown in development */}
            {process.env.NODE_ENV === 'development' && <TestConsole />}
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;
