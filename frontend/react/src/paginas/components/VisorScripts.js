import React, { useEffect, useState } from "react";

// Palabras clave básicas para varios lenguajes
const KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case", "break", "continue",
  "class", "extends", "constructor", "super", "import", "export", "from", "as", "try", "catch", "finally",
  "public", "private", "protected", "static", "void", "int", "float", "double", "char", "string", "new", "this",
  "true", "false", "null", "undefined"
];

// Regex para comentarios y strings (muy básico)
const COMMENT_REGEX = /(\/\/.*|#.*)/g;
const STRING_REGEX = /('[^']*'|"[^"]*"|`[^`]*`)/g;

function highlightBasic(code) {
  // Resalta comentarios
  code = code.replace(COMMENT_REGEX, match => `<span class="hl-comment">${match}</span>`);
  // Resalta strings
  code = code.replace(STRING_REGEX, match => `<span class="hl-string">${match}</span>`);
  // Resalta palabras clave
  code = code.replace(
    new RegExp(`\\b(${KEYWORDS.join("|")})\\b`, "g"),
    match => `<span class="hl-keyword">${match}</span>`
  );
  return code;
}

const VisorScripts = ({ nombre, blob }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!blob) {
      setLines(["No file provided"]);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const raw = e.target.result;
      // Escapamos HTML
      const escaped = raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      // Resaltado básico
      const highlighted = highlightBasic(escaped);
      setLines(highlighted.split("\n"));
    };
    reader.readAsText(blob);
  }, [blob]);

  return (
    <div style={{display: 'flex', height: '80%', flexDirection: 'column'}}>
    <div className="code-viewer-container">
      <pre className="code-viewer">
        {lines.map((line, idx) => (
          <div key={idx} className="code-line">
            <span className="line-number">{idx + 1}</span>
            <span
              className="line-content"
              dangerouslySetInnerHTML={{ __html: line || " " }}
            />
          </div>
        ))}
      </pre>
      <style>{`
        .code-viewer-container {
          background: var(--background);
          border: 1px solid var(--text-primary);
          border-radius: 5px;
          overflow-x: auto;
          max-width: 800px;
          height: 100%;
        }
        .code-viewer {
          margin: 0;
          padding: 1em;
          font-size: 1em;
        }
        .code-line {
          display: flex;
        }
        .line-number { 
          text-align: right;
          color: var(--text-secondary);
          user-select: none;
          margin-right: 1em;
        }
        .hl-keyword { color: #0074d9; font-weight: bold; }
        .hl-string { color: #2ecc40; }
        .hl-comment { color: var(--text-primary); font-style: italic; }
      `}</style>
    </div> 
    <span>Archivo: {nombre}</span>
    </div>
  );
};

export default VisorScripts;
