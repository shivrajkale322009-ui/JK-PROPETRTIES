"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle } = useAuth(); // Destructuring loginWithGoogle instead

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card"
      >
        <div className="login-header">
          <div className="logo-placeholder">
            <span className="logo-text">JK</span>
          </div>
          <h1 className="login-title">JK Properties</h1>
          <p className="login-subtitle">Premium Lead Management</p>
        </div>

        <div className="login-form">
          {error && <div className="login-error">{error}</div>}

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            className="login-submit-btn" 
            disabled={loading}
            style={{ display: 'flex', gap: '10px' }}
          >
            <LogIn size={20} />
            {loading ? "Signing In..." : "Sign in with Google"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
