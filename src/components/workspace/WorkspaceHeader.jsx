import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

function WorkspaceHeader() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const clearRoom = useChatStore((state) => state.clearRoom);

  const handleLogout = () => {
    logout();
    clearRoom();
    navigate("/login");
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h1>Cloud-Link IDE</h1>
        <span className="header-status">
          상태: 로그인됨 ({currentUser.name})
        </span>
      </div>

      <div className="header-actions">
        <button className="auth-button logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default WorkspaceHeader;