import { Link } from "react-router-dom";

function SignupPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>회원가입 페이지</h1>
      <p>민지님이 만든 UI 붙이기.</p>

      <div style={{ marginTop: "16px" }}>
        <Link to="/login">로그인으로 이동</Link>
      </div>
    </div>
  );
}

export default SignupPage;