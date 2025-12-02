import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  console.log(import.meta.env.VITE_BACKEND_URL)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("FETCHING:", `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();

      // Save JWT to localStorage
      localStorage.setItem("token", data.token);
      console.log("Login successful:", data);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-light">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Login to PayPals
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-lg hover:bg-teal-dark transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-neutral-dark mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
