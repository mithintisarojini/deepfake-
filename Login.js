import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      // call backend login — backend will set cookie
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      // store a simple flag (you can store user info returned later)
      localStorage.setItem("user", JSON.stringify({ email }));

      // go to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed. Make sure backend is running and credentials are correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 items-center min-h-[70vh] p-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
        <p className="mb-6 text-gray-600">Sign in to continue analyzing media</p>

        <label className="block uppercase text-sm tracking-wider">Email</label>
        <input
          className="w-full border p-3 mb-4"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block uppercase text-sm tracking-wider">Password</label>
        <input
          className="w-full border p-3 mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-black text-white p-3"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <a onClick={() => navigate("/")} className="underline cursor-pointer">Sign up</a>
        </div>
      </div>

      <div>
        <div className="h-[60vh] bg-cover bg-center" style={{backgroundImage: "url('/hero-side.jpg')"}}/>
      </div>
    </div>
  );
}
