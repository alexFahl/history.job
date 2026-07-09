import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useUiStore from "../../store/uiStore";
import LiveClock from "../common/LiveClock";

/**
 * Navbar
 *
 */
function Navbar() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const selectedProfile = useUiStore((state) => state.selectedProfile);
  const clearSelectedProfile = useUiStore(
    (state) => state.clearSelectedProfile,
  );

  const handleChangeProfile = () => {
    clearSelectedProfile();
    navigate("/profiles");
  };

  const handleLogout = () => {
    clearAuth();
    clearSelectedProfile();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Profile name + live clock */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <h1 className="text-text font-semibold">
            {selectedProfile?.profileName ?? "—"}
          </h1>
          <span className="text-white/20">·</span>
          <span className="text-secondary text-sm">
            {selectedProfile ? (
              <LiveClock timezone={selectedProfile.timezone} />
            ) : (
              "—"
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleChangeProfile}
            className="text-sm text-secondary hover:text-primary transition-colors duration-150"
          >
            Change profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-secondary hover:text-accent transition-colors duration-150"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
