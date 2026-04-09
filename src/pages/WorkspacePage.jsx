import "../App.css";
import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import FileTreeSidebar from "../components/workspace/FileTreeSidebar";
import EditorSection from "../components/workspace/EditorSection";
import ChatSidebar from "../components/workspace/ChatSidebar";

function WorkspacePage() {
  return (
    <div className="app">
      <WorkspaceHeader />

      <div className="workspace">
        <FileTreeSidebar />
        <EditorSection />
        <ChatSidebar />
      </div>
    </div>
  );
}

export default WorkspacePage;