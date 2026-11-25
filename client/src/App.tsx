import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { Home } from "./pages/Home";
import { ProductConfigure } from "./pages/ProductConfigure";
import { Designer } from "./pages/Designer";
import { ProofReview } from "./pages/ProofReview";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { AdminPipeline } from "./pages/AdminPipeline";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 font-sans selection:bg-amber-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/configure" element={<ProductConfigure />} />
              <Route path="/designer" element={<Designer />} />
              <Route path="/proof-review" element={<ProofReview />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/admin" element={<AdminPipeline />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
