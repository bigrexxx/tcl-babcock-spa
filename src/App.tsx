import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import IndexPage from "./pages/index";
import RegisterPage from "./pages/register";
import StudioPage from "./pages/studio";
import AuthPage from "./pages/auth";
import AdminPage from "./pages/admin";
import CommitteeDetailPage from "./pages/committees";
import StatusPage from "./pages/status";
import NotFoundPage from "./pages/not-found";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/committees/:id" element={<CommitteeDetailPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
