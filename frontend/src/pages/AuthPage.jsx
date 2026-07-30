import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/authApi";
import useAuthStore from "../store/authStore";
import Button from "../components/common/Button";
import logoWhite from "../assets/images/HJ_white.svg";

/**
 * AuthPage
 *
 * Split-screen entry point:
 *   - Left  : a branded presentation panel
 *   - Right : the Login / Register form
 */
function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Toggle between Login and Register mode
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      // Persist auth state
      setAuth(token, user);

      navigate("/profiles");
    } catch (err) {
      // The API returns
      const message =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectMode = (login) => {
    setIsLogin(login);
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* ============================================================= */}
      {/* Ambient background                                            */}
      {/* ============================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-aurora absolute -top-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-primary/25 blur-[140px]" />
        <div className="animate-aurora-alt absolute -bottom-48 -right-28 h-[32rem] w-[32rem] rounded-full bg-accent/20 blur-[150px]" />
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-radial" />
        <div className="bg-grid-dots absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      {/* ============================================================= */}
      {/* Centered auth                                                 */}
      {/* ============================================================= */}
      <div className="animate-fade-rise relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-4">
            <img
              src={logoWhite}
              alt="History.job logo"
              className="h-16 w-16 drop-shadow-[0_0_20px_rgba(124,92,255,0.55)]"
            />
            <span className="font-display text-5xl font-bold tracking-tight text-text">
              History
              <span className="text-gradient animate-gradient-pan">.</span>
              job
            </span>
          </div>
          <p className="mt-4 text-white">
            Track your international job search, all in{" "}
            <span className="text-accent">one place.</span>
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-4xl p-6 shadow-card sm:p-8">
          {/* Segmented toggle with animated indicator */}
          <div className="relative mb-8 flex rounded-xl bg-white/[0.04] p-1 ring-1 ring-inset ring-white/10">
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-lg bg-brand-gradient shadow-glow-sm transition-transform duration-300 ease-out"
              style={{
                transform: isLogin ? "translateX(0)" : "translateX(100%)",
              }}
            />
            <button
              type="button"
              onClick={() => selectMode(true)}
              className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 ${
                isLogin ? "text-white" : "text-secondary hover:text-text"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => selectMode(false)}
              className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 ${
                !isLogin ? "text-white" : "text-secondary hover:text-text"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {isLogin
                ? "Sign in to continue your job hunt."
                : "Just a username and password to get started."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-secondary"
              >
                Username
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30 transition-colors duration-200 group-focus-within:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-11 pr-4
                             text-sm text-text placeholder-white/25 transition-all duration-200
                             hover:border-white/20
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-secondary"
              >
                Password
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30 transition-colors duration-200 group-focus-within:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-11 pr-11
                             text-sm text-text placeholder-white/25 transition-all duration-200
                             hover:border-white/20
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/30 transition-colors duration-200 hover:text-secondary"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="animate-fade-rise flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="mt-0.5 h-4 w-4 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <span>{error}</span>
              </p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              rounded="rounded-xl"
              fullWidth
              disabled={isLoading}
              className="group relative overflow-hidden"
            >
              {!isLoading && (
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {isLoading && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isLoading
                  ? "Please wait…"
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </span>
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-secondary/70">
          Developed by Alex FAHLOUNE.
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
