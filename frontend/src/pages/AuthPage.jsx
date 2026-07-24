import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/authApi";
import useAuthStore from "../store/authStore";
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
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* ============================================================= */}
      {/* Presentation panel                                            */}
      {/* ============================================================= */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-14 bg-gradient-to-br from-primary/70 via-primary/40 to-background">
        {/* Animated aurora blobs */}
        <div className="animate-aurora pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="animate-aurora-alt pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
        <div className="animate-aurora pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

        {/* Dotted grid overlay + edge fade */}
        <div className="bg-grid-dots pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        {/* Brand */}
        <div className="animate-fade-rise relative flex items-center gap-5">
          <img src={logoWhite} alt="History.job logo" className="h-16 w-16" />
          <span className="text-6xl font-bold text-white">
            History<span className="text-secondary">.</span>job
          </span>
        </div>

        {/* Pitch */}
        <div className="animate-fade-rise relative max-w-xl [animation-delay:120ms]">
          <h2 className="mt-5 text-4xl font-bold leading-tight text-white">
            Track your international job search, all in{" "}
            <span className="text-accent text-5xl font-extrabold">
              one place.
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/85">
            Organize applications by country, follow every interview and reply
            on a clear timeline, and let AI fill in the details for you.
          </p>

          {/* Feature highlights */}
          <ul className="mt-10 space-y-3">
            <Feature
              delay={200}
              title="Differents profiles"
              text="Many countries, many job boards, one account."
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              }
            />
            <Feature
              delay={280}
              title="AI offer analysis"
              text="Paste an offer and let AI extract the key information."
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              }
            />
            <Feature
              delay={360}
              title="Kanban tracking"
              text="Track your applications in a clear, visual way."
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"
                />
              }
            />
            <Feature
              delay={440}
              title="Browser extension"
              text="Integrate easily an application from your browser."
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
                />
              }
            />
          </ul>
        </div>

        {/* Footer note */}
        <p className="animate-fade-rise relative text-sm text-white/70 [animation-delay:520ms]">
          Developed by Alex FAHLOUNE.
        </p>
      </aside>

      {/* ============================================================= */}
      {/* Auth form                                                     */}
      {/* ============================================================= */}
      <main className="relative flex items-center justify-center overflow-hidden px-6 py-12 sm:px-10">
        {/* Ambient glow — visible mostly on mobile where the left panel is hidden */}
        <div className="animate-aurora pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl lg:hidden" />
        <div className="animate-aurora-alt pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl lg:hidden" />

        <div className="animate-fade-rise relative w-full max-w-sm">
          {/* Logo shown on mobile only (the left panel is hidden there) */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-inset ring-primary/30">
              <img src={logoWhite} alt="History.job logo" className="h-7 w-7" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text">
              History<span className="text-primary">.</span>job
            </span>
          </div>

          {/* Card container */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
            {/* Switch between Sign In and Sign Up — segmented control */}
            <div className="mb-8 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 ring-1 ring-inset ring-white/10">
              <button
                type="button"
                onClick={() => selectMode(true)}
                className={`rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                  isLogin
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-secondary hover:text-text"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => selectMode(false)}
                className={`rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                  !isLogin
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-secondary hover:text-text"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm text-secondary">
                {isLogin
                  ? "Please enter your details to sign in."
                  : "Just a username and password to get started."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4
                               text-sm text-text placeholder-white/20
                               transition-all duration-200
                               hover:border-white/20
                               focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

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
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] py-3 pl-11 pr-11
                               text-sm text-text placeholder-white/20
                               transition-all duration-200
                               hover:border-white/20
                               focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                <p className="animate-fade-rise flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm text-accent">
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
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-lg bg-primary py-3 text-sm font-semibold text-white
                           shadow-lg shadow-primary/25 transition-all duration-200
                           hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background
                           active:translate-y-0
                           disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {/* Sheen sweep on hover */}
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
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Feature
 * A single bullet in the presentation panel
 */
function Feature({ title, text, icon, delay = 0 }) {
  return (
    <li
      className="animate-fade-rise flex items-start gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-inset ring-white/15 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:ring-white/25"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="h-5 w-5 text-white"
        >
          {icon}
        </svg>
      </span>
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-sm text-white/75">{text}</p>
      </div>
    </li>
  );
}

export default AuthPage;
