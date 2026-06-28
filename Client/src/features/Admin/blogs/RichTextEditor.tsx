import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const COLORS = [
  "#000000",
  "#ffffff",
  "#e74c3c",
  "#e67e22",
  "#f1c40f",
  "#2ecc71",
  "#1abc9c",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#95a5a6",
  "#e91e63",
  "#ff5722",
  "#607d8b",
  "#795548",
];

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      padding: "4px 8px",
      border: "1px solid #d9d9d9",
      borderRadius: 4,
      background: active ? "#1a1a2e" : "#fff",
      color: active ? "#fff" : "#333",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: active ? 700 : 400,
      transition: "all 0.15s",
    }}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: "8px 10px",
          background: "#fafafa",
          borderBottom: "1px solid #d9d9d9",
        }}
      >
        {/* Kalınlık */}
        <ToolbarButton
          title="Kalın"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <b>B</b>
        </ToolbarButton>

        {/* İtalik */}
        <ToolbarButton
          title="İtalik"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <i>I</i>
        </ToolbarButton>

        {/* Altı çizili */}
        <ToolbarButton
          title="Altı Çizili"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <u>U</u>
        </ToolbarButton>

        {/* Üstü çizili */}
        <ToolbarButton
          title="Üstü Çizili"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <s>S</s>
        </ToolbarButton>

        <div style={{ width: 1, background: "#d9d9d9", margin: "0 4px" }} />

        {/* Başlıklar */}
        <ToolbarButton
          title="Başlık 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="Başlık 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Başlık 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>

        <div style={{ width: 1, background: "#d9d9d9", margin: "0 4px" }} />

        {/* Liste */}
        <ToolbarButton
          title="Madde İşaretli Liste"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          • Liste
        </ToolbarButton>
        <ToolbarButton
          title="Numaralı Liste"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          1. Liste
        </ToolbarButton>

        <div style={{ width: 1, background: "#d9d9d9", margin: "0 4px" }} />

        {/* Hizalama */}
        <ToolbarButton
          title="Sola Hizala"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          ←
        </ToolbarButton>
        <ToolbarButton
          title="Ortala"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          ↔
        </ToolbarButton>
        <ToolbarButton
          title="Sağa Hizala"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          →
        </ToolbarButton>

        <div style={{ width: 1, background: "#d9d9d9", margin: "0 4px" }} />

        {/* Renk seçici */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#666" }}>Renk:</span>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: color,
                  border: editor.isActive("textStyle", { color })
                    ? "2px solid #1a1a2e"
                    : "1px solid #ccc",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ width: 1, background: "#d9d9d9", margin: "0 4px" }} />

        {/* Temizle */}
        <ToolbarButton
          title="Formatı Temizle"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          Temizle
        </ToolbarButton>
      </div>

      {/* Editör alanı */}
      <EditorContent
        editor={editor}
        style={{
          minHeight: 200,
          padding: "12px 16px",
          fontSize: 14,
          lineHeight: 1.6,
          outline: "none",
        }}
      />
    </div>
  );
};

export default RichTextEditor;
