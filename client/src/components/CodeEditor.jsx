import { useEffect, useRef, useState } from "react";

export default function CodeEditor({ code, setCode, language }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const container = document.getElementById("monaco-editor-container");
    if (!container) {
      console.error("Editor container not found");
      return;
    }

    import("monaco-editor").then((monaco) => {
      monacoRef.current = monaco;

      if (editorRef.current) {
        // Dispose of the existing editor instance
        editorRef.current.dispose();
      }

      editorRef.current = monaco.editor.create(container, {
        value: code,
        language: language === "cpp" ? "cpp" : "python",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: {
          enabled: false,
          scale: 0.8,
          showSlider: "mouseover",
        },
        scrollBeyondLastLine: true,
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: true,
        scrollbar: {
          useShadows: false,
          verticalHasArrows: true,
          horizontalHasArrows: true,
          vertical: "visible",
          horizontal: "visible",
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        wordWrap: "on",
        quickSuggestions: true,
        formatOnPaste: true,
        formatOnType: true,
      });

      // Set language-specific configurations
      if (language === "python") {
        monaco.languages.setLanguageConfiguration("python", {
          indentationRules: {
            increaseIndentPattern:
              /^\s*(def|class|for|if|elif|else|while|try|with|finally|except|async).*[:(]/,
            decreaseIndentPattern:
              /^\s*(pass|return|raise|break|continue|else|elif)/,
          },
        });
      }

      // Update the code state when the editor content changes
      editorRef.current.onDidChangeModelContent(() => {
        setCode(editorRef.current.getValue());
      });

      setIsEditorReady(true);
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      const currentValue = editorRef.current.getValue();

      // Update the editor's content if it doesn't match the `code` prop
      if (currentValue !== code) {
        editorRef.current.setValue(code);
      }

      // Update the editor's language
      const monaco = monacoRef.current;
      const model = editorRef.current.getModel();

      if (model && monaco) {
        monaco.editor.setModelLanguage(
          model,
          language === "cpp" ? "cpp" : "python"
        );
      } else {
        console.error("Editor model or Monaco instance is null");
      }
    }
  }, [code, language, isEditorReady]);

  return (
    <div
      id="monaco-editor-container"
      className="h-[calc(100vh-250px)] min-h-[300px] border border-gray-700 rounded-md overflow-hidden"
    ></div>
  );
}
