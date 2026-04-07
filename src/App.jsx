import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import "./App.css";

const INITIAL_HTML = ``;

const INITIAL_CSS = ``;

const INITIAL_JS = ``;

const FILE_TREE = [
  {
    type: "folder",
    name: "project",
    children: [
      {
        type: "folder",
        name: "public",
        children: [{ type: "file", name: "favicon.ico", editable: false }],
      },
      {
        type: "folder",
        name: "src",
        children: [
          { type: "file", name: "index.html", editable: true },
          {
            type: "folder",
            name: "styles",
            children: [{ type: "file", name: "style.css", editable: true }],
          },
          {
            type: "folder",
            name: "scripts",
            children: [{ type: "file", name: "script.js", editable: true }],
          },
        ],
      },
    ],
  },
];

const editorLayout = EditorView.theme({
  "&": {
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [currentUser, setCurrentUser] = useState({
    id: "user-me",
    name: "나",
  });

  const [currentRoom] = useState({
    id: "room-project",
    name: "프로젝트 단톡방",
  });

  const [participants, setParticipants] = useState([
    { id: "user-me", name: "나" },
    { id: "user-101", name: "민수" },
    { id: "user-102", name: "지훈" },
    { id: "user-103", name: "유나" },
  ]);

  const [selectedFile, setSelectedFile] = useState("project/src/index.html");
  const [htmlCode, setHtmlCode] = useState(INITIAL_HTML);
  const [cssCode, setCssCode] = useState(INITIAL_CSS);
  const [jsCode, setJsCode] = useState(INITIAL_JS);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [openFolders, setOpenFolders] = useState({
    project: true,
    "project/public": false,
    "project/src": true,
    "project/src/styles": true,
    "project/src/scripts": true,
  });

  const chatMessagesRef = useRef(null);

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTree = (nodes, depth = 0, parentPath = "") => {
    return nodes.map((node) => {
      const path = parentPath ? `${parentPath}/${node.name}` : node.name;

      if (node.type === "folder") {
        const isOpen = !!openFolders[path];

        return (
          <div key={path} className="tree-node">
            <button
              type="button"
              className="tree-folder-row"
              style={{ paddingLeft: `${10 + depth * 14}px` }}
              onClick={() => toggleFolder(path)}
            >
              <span className={`tree-arrow ${isOpen ? "open" : ""}`} />
              <span className="tree-icon folder-icon" />
              <span className="tree-label">{node.name}</span>
            </button>

            {isOpen && node.children?.length > 0 && (
              <div className="tree-children">
                {renderTree(node.children, depth + 1, path)}
              </div>
            )}
          </div>
        );
      }

      const isActive = selectedFile === path;

      return (
        <button
          key={path}
          type="button"
          className={`tree-file-row ${isActive ? "active" : ""} ${
            !node.editable ? "disabled" : ""
          }`}
          style={{ paddingLeft: `${28 + depth * 14}px` }}
          onClick={() => node.editable && setSelectedFile(path)}
        >
          <span className="tree-arrow spacer" />
          <span className="tree-icon file-icon" />
          <span className="tree-label">{node.name}</span>
        </button>
      );
    });
  };

  const currentFileName = selectedFile.split("/").pop() || "";

  const currentCode = selectedFile.endsWith("index.html")
    ? htmlCode
    : selectedFile.endsWith("style.css")
    ? cssCode
    : selectedFile.endsWith("script.js")
    ? jsCode
    : "";

  const currentExtensions = selectedFile.endsWith("index.html")
    ? [html(), EditorView.lineWrapping, editorLayout]
    : selectedFile.endsWith("style.css")
    ? [cssLang(), EditorView.lineWrapping, editorLayout]
    : [javascript(), EditorView.lineWrapping, editorLayout];

  const handleCodeChange = (value) => {
    if (selectedFile.endsWith("index.html")) setHtmlCode(value);
    if (selectedFile.endsWith("style.css")) setCssCode(value);
    if (selectedFile.endsWith("script.js")) setJsCode(value);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      setPassword("");
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          roomId: currentRoom.id,
          type: "system",
          text: `${currentUser.name}님이 로그아웃했습니다.`,
          createdAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      return;
    }

    setShowLoginModal(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const displayName = email?.split("@")[0]?.trim() || "나";

    setCurrentUser({
      id: "user-me",
      name: displayName,
    });

    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === "user-me"
          ? { ...participant, name: displayName }
          : participant
      )
    );

    setIsLoggedIn(true);
    setShowLoginModal(false);
    setPassword("");

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        roomId: currentRoom.id,
        type: "system",
        text: `${displayName}님이 입장했습니다.`,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleSendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: Date.now(),
      roomId: currentRoom.id,
      type: "message",
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: trimmed,
      createdAt: now,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const srcDoc = useMemo(() => {
    const safeJs = jsCode.replace(/<\/script>/gi, "<\\/script>");
    const styleTag = `<style>\n${cssCode}\n</style>`;
    const userScript = `<script>\n${safeJs}\n<\/script>`;

    if (/<html[\s>]/i.test(htmlCode)) {
      let doc = htmlCode;

      if (/<\/head>/i.test(doc)) {
        doc = doc.replace(/<\/head>/i, `${styleTag}\n</head>`);
      } else if (/<body[\s>]/i.test(doc)) {
        doc = doc.replace(/<body([^>]*)>/i, `${styleTag}\n<body$1>`);
      } else {
        doc = `${styleTag}\n${doc}`;
      }

      if (/<\/body>/i.test(doc)) {
        doc = doc.replace(/<\/body>/i, `${userScript}\n</body>`);
      } else {
        doc = `${doc}\n${userScript}`;
      }

      return doc;
    }

    return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${styleTag}
  </head>
  <body>
    ${htmlCode}
    ${userScript}
  </body>
</html>`;
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="app">
      <header className="top-header">
        <div className="header-left">
          <h1>Cloud-Link IDE</h1>
          <span className="header-status">
            상태: {isLoggedIn ? `로그인됨 (${currentUser.name})` : "게스트"}
          </span>
        </div>

        <div className="header-actions">
          <button
            className={`auth-button ${isLoggedIn ? "logout" : ""}`}
            onClick={handleAuthClick}
          >
            {isLoggedIn ? "로그아웃" : "로그인"}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="left-sidebar">
          <div className="sidebar-title">작업 영역</div>
          <div className="tree-root">{renderTree(FILE_TREE)}</div>
        </aside>

        <main className="center-panel">
          <div className="editor-toolbar">
            <div className="editor-meta">
              <span className="current-file">{currentFileName}</span>
              <span className="file-type">
                {selectedFile.endsWith("index.html")
                  ? "HTML"
                  : selectedFile.endsWith("style.css")
                  ? "CSS"
                  : "JavaScript"}
              </span>
            </div>
          </div>

          <div className="editor-area">
            <CodeMirror
              className="code-editor"
              value={currentCode}
              theme="dark"
              extensions={currentExtensions}
              onChange={handleCodeChange}
            />
          </div>

          <section className="bottom-panel">
            <div className="bottom-panel-title">결과화면</div>

            <div className="bottom-content">
              <iframe
                title="preview"
                className="preview-frame"
                srcDoc={srcDoc}
                sandbox="allow-scripts"
              />
            </div>
          </section>
        </main>

        <aside className="right-sidebar">
          <div className="chat-header">
            <div className="chat-room-info">
              <div className="chat-room-name">{currentRoom.name}</div>
              <div className="chat-room-meta">
                참여자 {participants.length}명 ·{" "}
                {participants.map((p) => p.name).join(", ")}
              </div>
            </div>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map((message) => {
              if (message.type === "system") {
                return (
                  <div key={message.id} className="chat-message system">
                    <div className="chat-system-text">
                      {message.text} · {message.createdAt}
                    </div>
                  </div>
                );
              }

              const isMine = message.senderId === currentUser.id;

              return (
                <div
                  key={message.id}
                  className={`chat-message ${isMine ? "mine" : "other"}`}
                >
                  {!isMine && (
                    <div className="chat-message-header">
                      <span className="chat-sender">{message.senderName}</span>
                      <span className="chat-time">{message.createdAt}</span>
                    </div>
                  )}

                  <div className="chat-message-body">
                    <div className="chat-bubble">{message.text}</div>
                  </div>

                  {isMine && (
                    <div className="chat-message-header mine-header">
                      <span className="chat-time">{message.createdAt}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="단톡방 메시지를 입력하세요"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
            />

            <button className="chat-send-button" onClick={handleSendChat}>
              전송
            </button>
          </div>
        </aside>
      </div>

      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h2>로그인</h2>

            <form onSubmit={handleLoginSubmit}>
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

              <div className="login-modal-buttons">
                <button type="submit">로그인</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowLoginModal(false)}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;