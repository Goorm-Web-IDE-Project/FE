import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

function WebIDE({ onLogout }) {
  const [htmlCode, setHtmlCode] = useState(`<div class="card">
  <h1>Hello</h1>
  <button id="btn">클릭</button>
</div>`);

  const [cssCode, setCssCode] = useState(`body {
  font-family: Arial, sans-serif;
  background: #f8fafc;
  padding: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

h1 {
  color: royalblue;
}`);

  const [jsCode, setJsCode] = useState(`const btn = document.getElementById("btn");

btn.addEventListener("click", () => {
  alert("버튼 클릭됨!");
});`);

  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            ${jsCode}
          <\/script>
        </body>
      </html>
    `;
  }, [htmlCode, cssCode, jsCode]);

  return (
    <div className="ide-layout">
      <aside className="sidebar">
        <div>
          <h2 className="logo">My IDE</h2>
          <nav className="menu">
            <div className="menu-item active">index.html</div>
            <div className="menu-item">style.css</div>
            <div className="menu-item">script.js</div>
          </nav>
        </div>
      </aside>

      <main className="ide-main">
        <header className="topbar">
          <div>
            <h3>웹 IDE 화면</h3>
            <p>HTML / CSS / JS를 따로 작성하고 하나로 합쳐서 미리보기</p>
          </div>

          <button className="top-login-btn" onClick={onLogout}>
            로그인
          </button>
        </header>

        <section className="editor-preview">
          <div className="editor-panel">
            <div className="panel-title">HTML</div>
            <CodeMirror
              value={htmlCode}
              height="200px"
              theme="dark"
              extensions={[html()]}
              onChange={(value) => setHtmlCode(value)}
            />

            <div className="panel-title">CSS</div>
            <CodeMirror
              value={cssCode}
              height="200px"
              theme="dark"
              onChange={(value) => setCssCode(value)}
            />

            <div className="panel-title">JavaScript</div>
            <CodeMirror
              value={jsCode}
              height="200px"
              theme="dark"
              onChange={(value) => setJsCode(value)}
            />
          </div>

          <div className="preview-panel">
            <div className="panel-title">미리보기</div>
            <iframe
              title="preview"
              className="preview-frame"
              srcDoc={srcDoc}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default WebIDE;