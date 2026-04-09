import { useNavigate } from "react-router-dom";

function WorkspaceHeader({ currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUserName");
    sessionStorage.removeItem("currentUserId");
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