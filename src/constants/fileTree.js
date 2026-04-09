export const FILE_TREE = [
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