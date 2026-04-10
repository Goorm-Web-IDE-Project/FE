import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { userId, password, confirmPassword, name } = formData;

    if (!userId || !password || !confirmPassword || !name) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    console.log("회원가입 데이터:", formData);
    alert("회원가입이 완료되었습니다!");

    navigate("/login");
  };

  return (
    <div className="signPage">
      <div className="signBox">
        <h1 className="signTitle">Sign Up</h1>
        <p className="signText">회원가입 정보를 입력해주세요.</p>

        <form className="signForm" onSubmit={handleSubmit}>
          <div className="signName">
            <label htmlFor="signName">이름</label>
            <input
              id="signName"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름 입력"
            />
          </div>

          <div className="signId">
            <label htmlFor="signId">ID</label>
            <input
              id="signId"
              name="userId"
              type="text"
              value={formData.userId}
              onChange={handleChange}
              placeholder="아이디 입력"
            />
          </div>

          <div className="signPassword">
            <label htmlFor="signPassword">PW</label>
            <input
              id="signPassword"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
            />
          </div>

          <div className="signConfirmPassword">
            <label htmlFor="signConfirmPassword">PW 확인</label>
            <input
              id="signConfirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 다시 입력"
            />
          </div>

          <div className="signButtons">
            <button className="signButton" type="submit">
              가입하기
            </button>
            <button
              className="cancelButton"
              type="button"
              onClick={() => navigate("/login")}
            >
              취소
            </button>
          </div>
        </form>

        <div className="signLink">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;