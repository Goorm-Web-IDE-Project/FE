import { useState } from "react";
import "../App.css";
import WorkspaceHeader from "../components/WorkspaceHeader";
import FileTreeSidebar from "../components/FileTreeSidebar";
import EditorSection from "../components/EditorSection";
import ChatSidebar from "../components/ChatSidebar";

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

function WorkspacePage() {
  const savedName = sessionStorage.getItem("currentUserName") || "나";
  const savedId = sessionStorage.getItem("currentUserId") || "user-me";

  const [currentUser] = useState({
    id: savedId,
    name: savedName,
  });

  const [currentRoom] = useState({
    id: "room-project",
    name: "프로젝트 단톡방",
  });

  const [participants] = useState([
    { id: "user-me", name: savedName },
    { id: "user-101", name: "민수" },
    { id: "user-102", name: "지훈" },
    { id: "user-103", name: "유나" },
  ]);

  const [selectedFile, setSelectedFile] = useState("project/src/index.html");
  const [htmlCode, setHtmlCode] = useState(INITIAL_HTML);
  const [cssCode, setCssCode] = useState(INITIAL_CSS);
  const [jsCode, setJsCode] = useState(INITIAL_JS);

  const [openFolders, setOpenFolders] = useState({
    project: true,
    "project/public": false,
    "project/src": true,
    "project/src/styles": true,
    "project/src/scripts": true,
  });

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <div className="app">
      <WorkspaceHeader currentUser={currentUser} />

      <div className="workspace">
        <FileTreeSidebar
          fileTree={FILE_TREE}
          openFolders={openFolders}
          selectedFile={selectedFile}
          toggleFolder={toggleFolder}
          setSelectedFile={setSelectedFile}
        />

        <EditorSection
          selectedFile={selectedFile}
          htmlCode={htmlCode}
          cssCode={cssCode}
          jsCode={jsCode}
          setHtmlCode={setHtmlCode}
          setCssCode={setCssCode}
          setJsCode={setJsCode}
        />

        <ChatSidebar
          currentRoom={currentRoom}
          participants={participants}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

export default WorkspacePage;