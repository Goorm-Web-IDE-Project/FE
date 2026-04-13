import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import "../App.css";
import {
  getFileTree,
  createFileOrFolder,
  saveFile,
} from "../api/files";

const INITIAL_HTML = ``;
const INITIAL_CSS = ``;
const INITIAL_JS = ``;

const editorLayout = EditorView.theme({
  "&": {
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
});

const buildOpenFolders = (nodes, map = {}) => {
  nodes.forEach((node) => {
    const isFolder =
      node.type === "folder" ||
      (Array.isArray(node.children) && node.children.length > 0);

    if (isFolder) {
      map[node.path] = true;
      if (Array.isArray(node.children)) {
        buildOpenFolders(node.children, map);
      }
    }
  });

  return map;
};

const findFirstEditableFile = (nodes) => {
  for (const node of nodes) {
    const isFolder =
      node.type === "folder" ||
      (Array.isArray(node.children) && node.children.length > 0);

    if (!isFolder && node.editable) {
      return node.path;
    }

    if (isFolder && Array.isArray(node.children)) {
      const found = findFirstEditableFile(node.children);
      if (found) return found;
    }
  }

  return "";
};

function WorkspacePage() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("currentUserName") || "나";
  const userId = sessionStorage.getItem("currentUserId") || userName;

  const [fileTree, setFileTree] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const [selectedFile, setSelectedFile] = useState("");

  const [htmlCode, setHtmlCode] = useState(INITIAL_HTML);
  const [cssCode, setCssCode] = useState(INITIAL_CSS);
  const [jsCode, setJsCode] = useState(INITIAL_JS);

  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const fetchTree = async () => {
    try {
      setIsLoadingTree(true);

      const response = await getFileTree(userId);
      const treeData = Array.isArray(response.data) ? response.data : [];

      setFileTree(treeData);
      setOpenFolders(buildOpenFolders(treeData));

      if (!selectedFile) {
        const firstFile = findFirstEditableFile(treeData);
        if (firstFile) {
          setSelectedFile(firstFile);
        }
      }
    } catch (error) {
      console.error("파일트리 조회 실패:", error);
      alert("파일트리 조회에 실패했습니다.");
    } finally {
      setIsLoadingTree(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const currentFileName = selectedFile.split("/").pop() || "";

  const currentCode = selectedFile.endsWith(".html")
    ? htmlCode
    : selectedFile.endsWith(".css")
    ? cssCode
    : selectedFile.endsWith(".js")
    ? jsCode
    : "";

  const currentExtensions = selectedFile.endsWith(".html")
    ? [html(), EditorView.lineWrapping, editorLayout]
    : selectedFile.endsWith(".css")
    ? [cssLang(), EditorView.lineWrapping, editorLayout]
    : [javascript(), EditorView.lineWrapping, editorLayout];

  const handleCodeChange = (value) => {
    if (selectedFile.endsWith(".html")) setHtmlCode(value);
    if (selectedFile.endsWith(".css")) setCssCode(value);
    if (selectedFile.endsWith(".js")) setJsCode(value);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      alert("저장할 파일을 선택해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      await saveFile({
        filePath: selectedFile,
        content: currentCode,
      });

      alert("저장되었습니다.");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async (type) => {
    const name = prompt(type === "folder" ? "새 폴더 이름" : "새 파일 이름");

    if (!name) return;

    const defaultParentPath = selectedFile.includes("/")
      ? selectedFile.substring(0, selectedFile.lastIndexOf("/"))
      : "project/src";

    try {
      await createFileOrFolder({
        parentPath: defaultParentPath,
        name,
        type,
      });

      await fetchTree();
      alert(type === "folder" ? "폴더가 생성되었습니다." : "파일이 생성되었습니다.");
    } catch (error) {
      console.error("생성 실패:", error);
      alert("생성에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUserName");
    sessionStorage.removeItem("currentUserId");
    navigate("/login");
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
      senderName: userName,
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

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isFolder =
        node.type === "folder" ||
        (Array.isArray(node.children) && node.children.length > 0);

      if (isFolder) {
        const isOpen = !!openFolders[node.path];

        return (
          <div key={node.path} className="tree-node">
            <button
              type="button"
              className="tree-folder-row"
              style={{ paddingLeft: `${10 + depth * 14}px` }}
              onClick={() => toggleFolder(node.path)}
            >
              <span className={`tree-arrow ${isOpen ? "open" : ""}`} />
              <span className="tree-icon folder-icon" />
              <span className="tree-label">{node.name}</span>
            </button>

            {isOpen && Array.isArray(node.children) && node.children.length > 0 && (
              <div className="tree-children">{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isActive = selectedFile === node.path;

      return (
        <button
          key={node.path}
          type="button"
          className={`tree-file-row ${isActive ? "active" : ""} ${
            !node.editable ? "disabled" : ""
          }`}
          style={{ paddingLeft: `${28 + depth * 14}px` }}
          onClick={() => node.editable && setSelectedFile(node.path)}
        >
          <span className="tree-arrow spacer" />
          <span className="tree-icon file-icon" />
          <span className="tree-label">{node.name}</span>
        </button>
      );
    });
  };

  return (
    <div className="app">
      <header className="top-header">
        <div className="header-left">
          <h1>Cloud-Link IDE</h1>
          <span className="header-status">상태: 로그인됨 ({userName})</span>
        </div>

        <div className="header-actions">
          <button className="auth-button logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="left-sidebar">
          <div className="sidebar-title">작업 영역</div>

          <div className="sidebar-action-row">
            <button
              type="button"
              className="sidebar-icon-button"
              title="파일 생성"
              onClick={() => handleCreate("file")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 3v5h5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11v6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M9 14h6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className="sidebar-icon-button"
              title="폴더 생성"
              onClick={() => handleCreate("folder")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12.5v5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M9.5 15h5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {isLoadingTree ? (
            <div style={{ padding: "12px", fontSize: "12px", color: "#94a3b8" }}>
              불러오는 중...
            </div>
          ) : (
            <div className="tree-root">{renderTree(fileTree)}</div>
          )}
        </aside>

        <main className="center-panel">
          <div className="editor-toolbar">
            <div className="editor-meta">
              <span className="current-file">{currentFileName || "파일 선택"}</span>
              <span className="file-type">
                {selectedFile.endsWith(".html")
                  ? "HTML"
                  : selectedFile.endsWith(".css")
                  ? "CSS"
                  : selectedFile.endsWith(".js")
                  ? "JavaScript"
                  : "TEXT"}
              </span>
            </div>

            <div className="editor-actions">
              <button
                className="editor-action-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
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
              <div className="chat-room-name">채팅</div>
              <div className="chat-room-meta">
                현재 로그인 사용자: {userName}
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-message system">
                <div className="chat-system-text">아직 채팅이 없습니다.</div>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className="chat-message mine">
                  <div className="chat-message-body">
                    <div className="chat-bubble">{message.text}</div>
                  </div>
                  <div className="chat-message-header mine-header">
                    <span className="chat-time">{message.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="메세지를 입력하세요"
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
    </div>
  );
}

export default WorkspacePage;