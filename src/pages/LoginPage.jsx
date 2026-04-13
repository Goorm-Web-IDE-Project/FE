import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { loginRequest } from "../api/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [loginId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginId || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await loginRequest({
        userId: loginId,
        password,
        name: loginId,
      });

      console.log("로그인 응답:", response.data);

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("currentUserName", loginId);
      sessionStorage.setItem("currentUserId", "user-me");

      navigate("/workspace");
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginBox">
        <h1 className="loginTitle">Login</h1>
        <p className="loginText">아이디와 비밀번호를 입력해주세요.</p>

        <form className="loginForm" onSubmit={handleSubmit}>
          <div className="loginId">
            <label htmlFor="loginId">ID</label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디 입력"
            />
          </div>

          <div className="loginPassword">
            <label htmlFor="loginPassword">PW</label>
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </div>

          <button className="loginButton" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="loginLink">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;