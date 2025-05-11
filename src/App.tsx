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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateEvermarkPage />} />
              <Route path="/my-evermarks" element={<MyEvermarksPage />} />
              <Route path="/evermark/:id" element={<EvermarkDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;