import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import useFileTreeStore from "../../store/fileTreeStore";
import useEditorStore from "../../store/editorStore";

const editorLayout = EditorView.theme({
  "&": {
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
});

function EditorSection() {
  const selectedFile = useFileTreeStore((state) => state.selectedFile);
  const {
    htmlCode,
    cssCode,
    jsCode,
    setHtmlCode,
    setCssCode,
    setJsCode,
  } = useEditorStore();

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

  return (
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
  );
}

export default EditorSection;