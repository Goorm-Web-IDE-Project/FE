import { FILE_TREE } from "../../constants/fileTree";
import useFileTreeStore from "../../store/fileTreeStore";

function FileTreeSidebar() {
  const { selectedFile, openFolders, toggleFolder, setSelectedFile } =
    useFileTreeStore();

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

  return (
    <aside className="left-sidebar">
      <div className="sidebar-title">작업 영역</div>
      <div className="tree-root">{renderTree(FILE_TREE)}</div>
    </aside>
  );
}

export default FileTreeSidebar;