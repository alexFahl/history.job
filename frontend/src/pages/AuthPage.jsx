import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/authApi";
import useAuthStore from "../store/authStore";

/**
 * AuthPage
 *
 * The entry point of the application. Displays either a Login or Register form
 * depending on the `isLogin` toggle state
 *
 */
function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Toggle between Login and Register mode
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI feedback state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiCall = isLogin ? login : register;
      const response = await apiCall({ username, password });
      const { token, user } = response.data;

      // Persist auth state — from this point, all axios requests will include the token
      setAuth(token, user);

      navigate("/profiles");
    } catch (err) {
      // The API returns { message: "..." } on errors — display it to the user
      const message =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / App name */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-text tracking-tight">
            History<span className="text-primary">.</span>job
          </h1>
          <p className="mt-2 text-secondary text-sm">
            Track your international job search
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-white/[0.06] p-1 mb-8">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isLogin
                  ? "bg-primary text-white shadow"
                  : "text-secondary hover:text-text"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                !isLogin
                  ? "bg-primary text-white shadow"
                  : "text-secondary hover:text-text"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-secondary mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoComplete="username"
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3
                           text-text placeholder-white/20 text-sm
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                           transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-secondary mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3
                           text-text placeholder-white/20 text-sm
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                           transition-colors duration-200"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-lg text-sm
                         transition-all duration-200 shadow-lg shadow-primary/20"
            >
              {isLoading
                ? "Please wait…"
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-6">
          Your data is stored securely and privately.
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
