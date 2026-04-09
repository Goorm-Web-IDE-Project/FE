import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const displayName = email?.split("@")[0]?.trim() || "나";

    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("currentUserName", displayName);
    sessionStorage.setItem("currentUserId", "user-me");

    navigate("/workspace");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>로그인</h1>

      <form
        onSubmit={handleLoginSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "320px",
          marginTop: "20px",
        }}
      >
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">로그인</button>
      </form>

      <div style={{ marginTop: "16px" }}>
        <Link to="/signup">회원가입으로 이동</Link>
      </div>
    </div>
  );
}

export default LoginPage;