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
  {
    type: "folder",
    name: "public",
    children: [{ type: "file", name: "favicon.ico", editable: false }],
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

  const [selectedFile, setSelectedFile] = useState("index.html");
  const [htmlCode, setHtmlCode] = useState(INITIAL_HTML);
  const [cssCode, setCssCode] = useState(INITIAL_CSS);
  const [jsCode, setJsCode] = useState(INITIAL_JS);

  const [chatMessages, setChatMessages] = useState([
 

  ]);
  const [chatInput, setChatInput] = useState("");

  const [bottomTab, setBottomTab] = useState("preview");
  const [logs, setLogs] = useState([
    { type: "info", text: "IDE가 준비되었습니다." },
  ]);

  const [openFolders, setOpenFolders] = useState({
    src: true,
    "src/styles": true,
    "src/scripts": true,
    public: true,
  });

  const chatMessagesRef = useRef(null);
  const debugConsoleRef = useRef(null);

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
        const isOpen = openFolders[path];

        return (
          <div key={path} className="tree-node">
            <button
              type="button"
              className="tree-folder-row"
              style={{ paddingLeft: `${12 + depth * 14}px` }}
              onClick={() => toggleFolder(path)}
            >
              <span className="tree-arrow">{isOpen ? "▾" : "▸"}</span>
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

      return (
        <button
          key={path}
          type="button"
          className={`tree-file tree-file-row ${
            selectedFile === node.name ? "active" : ""
          } ${!node.editable ? "disabled" : ""}`}
          style={{ paddingLeft: `${34 + depth * 14}px` }}
          onClick={() => node.editable && setSelectedFile(node.name)}
        >
          {node.name}
        </button>
      );
    });
  };

  const currentCode =
    selectedFile === "index.html"
      ? htmlCode
      : selectedFile === "style.css"
      ? cssCode
      : selectedFile === "script.js"
      ? jsCode
      : "";

  const currentExtensions =
    selectedFile === "index.html"
      ? [html(), EditorView.lineWrapping, editorLayout]
      : selectedFile === "style.css"
      ? [cssLang(), EditorView.lineWrapping, editorLayout]
      : [javascript(), EditorView.lineWrapping, editorLayout];

  const handleCodeChange = (value) => {
    if (selectedFile === "index.html") setHtmlCode(value);
    if (selectedFile === "style.css") setCssCode(value);
    if (selectedFile === "script.js") setJsCode(value);
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

  const handleClearLogs = () => {
    setLogs([{ type: "info", text: "콘솔이 비워졌습니다." }]);
    setBottomTab("debug");
  };

  const buildPreviewBridgeScript = () => `
    <script>
      (function () {
        const formatValue = (value) => {
          if (typeof value === "string") return value;
          try {
            return JSON.stringify(value, null, 2);
          } catch (error) {
            return String(value);
          }
        };

        const sendToParent = (kind, payload) => {
          window.parent.postMessage(
            {
              source: "custom-web-ide-preview",
              kind,
              payload,
            },
            "*"
          );
        };

        const originalLog = console.log.bind(console);
        const originalWarn = console.warn.bind(console);
        const originalError = console.error.bind(console);

        console.log = (...args) => {
          sendToParent("log", args.map(formatValue));
          originalLog(...args);
        };

        console.warn = (...args) => {
          sendToParent("warn", args.map(formatValue));
          originalWarn(...args);
        };

        console.error = (...args) => {
          sendToParent("error", args.map(formatValue));
          originalError(...args);
        };

        window.addEventListener("error", (event) => {
          sendToParent("error", [
            event.message + " (" + event.lineno + ":" + event.colno + ")",
          ]);
        });

        window.addEventListener("DOMContentLoaded", () => {
          sendToParent("info", ["미리보기가 다시 렌더링되었습니다."]);
        });
      })();
    <\/script>
  `;

  const srcDoc = useMemo(() => {
    const safeJs = jsCode.replace(/<\/script>/gi, "<\\/script>");
    const styleTag = `<style>\n${cssCode}\n</style>`;
    const bridgeScript = buildPreviewBridgeScript();
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
        doc = doc.replace(
          /<\/body>/i,
          `${bridgeScript}\n${userScript}\n</body>`
        );
      } else {
        doc = `${doc}\n${bridgeScript}\n${userScript}`;
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
    ${bridgeScript}
    ${userScript}
  </body>
</html>`;
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    const handler = (event) => {
      const data = event.data;
      if (!data || data.source !== "custom-web-ide-preview") return;

      const text = Array.isArray(data.payload)
        ? data.payload.join(" ")
        : String(data.payload);

      setLogs((prev) => [...prev, { type: data.kind, text }]);
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (bottomTab === "debug" && debugConsoleRef.current) {
      debugConsoleRef.current.scrollTop = debugConsoleRef.current.scrollHeight;
    }
  }, [logs, bottomTab]);

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
          <button className="small-button" onClick={handleClearLogs}>
            콘솔 비우기
          </button>
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
          <div className="sidebar-title">파일 탐색기</div>
          <div className="tree-root">{renderTree(FILE_TREE)}</div>
        </aside>

        <main className="center-panel">
          <div className="editor-toolbar">
            <div className="editor-meta">
              <span className="current-file">{selectedFile}</span>
              <span className="file-type">
                {selectedFile === "index.html"
                  ? "HTML"
                  : selectedFile === "style.css"
                  ? "CSS"
                  : "JavaScript"}
              </span>
            </div>

            <div className="editor-toolbar-actions">
              <button
                className="small-button"
                onClick={() => setBottomTab("preview")}
              >
                결과 보기
              </button>
              <button
                className="small-button"
                onClick={() => setBottomTab("debug")}
              >
                디버그 보기
              </button>
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
            <div className="bottom-tabs">
              <button
                className={bottomTab === "preview" ? "active" : ""}
                onClick={() => setBottomTab("preview")}
              >
                결과 출력
              </button>
              <button
                className={bottomTab === "debug" ? "active" : ""}
                onClick={() => setBottomTab("debug")}
              >
                디버그 콘솔
              </button>
            </div>

            <div className="bottom-content">
              {bottomTab === "preview" ? (
                <iframe
                  title="preview"
                  className="preview-frame"
                  srcDoc={srcDoc}
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="debug-console" ref={debugConsoleRef}>
                  {logs.map((log, index) => (
                    <div key={index} className={`log-row ${log.type}`}>
                      <span className="log-type">{log.type}</span>
                      <span className="log-text">{log.text}</span>
                    </div>
                  ))}
                </div>
              )}
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