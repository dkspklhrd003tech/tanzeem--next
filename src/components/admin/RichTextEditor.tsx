"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { Image } from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Type,
  AlignJustify,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  defaultToUrdu?: boolean;
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  tooltip,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
          disabled={disabled}
          className={cn(
            "h-8 w-8 rounded-md transition-all",
            isActive ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-foreground-muted hover:bg-muted"
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
  defaultToUrdu = false,
}: RichTextEditorProps) {
  const [showHTML, setShowHTML] = useState(false);
  const [htmlValue, setHtmlValue] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      TextStyle,
      FontFamily,
      Color,
      Image,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlValue(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-foreground [&>*]:[unicode-bidi:plaintext] [&>*]:text-start",
          className
        ),
        dir: "auto",
        style: "font-family: 'Inter', 'Jameel Noori Nastaleeq', sans-serif; line-height: 1.8;",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (!showHTML) {
        editor.commands.setContent(content);
      }
      setHtmlValue(content);
    }
  }, [content, editor, showHTML]);

  useEffect(() => {
    if (!editor) return;
    if (defaultToUrdu) {
      editor.chain().focus().setTextAlign("right").setFontFamily("'Scheherazade New', 'Jameel Noori Nastaleeq', serif").run();
    } else {
      editor.chain().focus().setTextAlign("left").unsetFontFamily().run();
    }
  }, [editor, defaultToUrdu]);

  if (!editor) return null;

  const toggleHTML = () => {
    if (showHTML) {
      editor.commands.setContent(htmlValue);
      setShowHTML(false);
    } else {
      const currentHTML = editor.getHTML();
      setHtmlValue(currentHTML);
      setShowHTML(true);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };


  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b border-border">
        {/* Toggle HTML view */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleHTML}
                className={cn(
                  "h-8 px-2.5 rounded-md text-xs font-bold tracking-wide transition-all border flex items-center gap-1.5",
                  showHTML
                    ? "bg-[#0d5844] text-white border-[#0d5844] hover:bg-[#0a4534]"
                    : "bg-muted text-foreground-muted border-border hover:bg-muted/80"
                )}
              >
                <Code className="h-3.5 w-3.5" />
                {showHTML ? "Rich Text View" : "HTML Source"}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {showHTML ? "Switch to Rich Text Editor" : "Switch to Raw HTML Source Editor"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!showHTML && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1 bg-border" />


            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                tooltip="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                tooltip="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                tooltip="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                tooltip="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </MenuButton>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

            {/* Headings */}
            <div className="flex items-center gap-1">
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                tooltip="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                tooltip="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                tooltip="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                isActive={editor.isActive("paragraph")}
                tooltip="Paragraph"
              >
                <Type className="h-4 w-4" />
              </MenuButton>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

            {/* Lists */}
            <div className="flex items-center gap-1">
              <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                tooltip="Bullet List"
              >
                <List className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                tooltip="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                tooltip="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </MenuButton>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                isActive={editor.isActive({ textAlign: "left" })}
                tooltip="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                isActive={editor.isActive({ textAlign: "center" })}
                tooltip="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                isActive={editor.isActive({ textAlign: "right" })}
                tooltip="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                isActive={editor.isActive({ textAlign: "justify" })}
                tooltip="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </MenuButton>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

            {/* Custom Styles (Color & Arabic Font) */}
            <div className="flex items-center gap-1">
              <input
                type="color"
                onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                value={editor.getAttributes("textStyle").color || "#000000"}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                title="Text Color"
              />
              <MenuButton
                onClick={() => editor.chain().focus().setColor("#84cc16").run()}
                isActive={editor.getAttributes("textStyle").color === "#84cc16"}
                tooltip="Light Green Text"
              >
                <div className="w-3 h-3 rounded-full bg-[#84cc16]" />
              </MenuButton>
              <MenuButton
                onClick={() => {
                  if (editor.isActive("textStyle", { fontFamily: "'Scheherazade New', 'jameel noori nastaleeq', serif" })) {
                    editor.chain().focus().unsetFontFamily().run();
                  } else {
                    editor.chain().focus().setFontFamily("'Scheherazade New', 'Jameel Noori Nastaleeq', serif").run();
                  }
                }}
                isActive={editor.isActive("textStyle", { fontFamily: "'Scheherazade New', 'Jameel Noori Nastaleeq', serif" })}
                tooltip="Arabic Text"
              >
                <span className="font-bold text-sm leading-none" dir="rtl">ع</span>
              </MenuButton>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

            {/* Link & History */}
            <div className="flex items-center gap-1">
              <MenuButton onClick={setLink} isActive={editor.isActive("link")} tooltip="Insert Link">
                <LinkIcon className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                tooltip="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                tooltip="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </MenuButton>
            </div>
          </>
        )}
      </div>


      {/* Editor Surface */}
      <div className="relative">
        {showHTML ? (
          <textarea
            value={htmlValue}
            onChange={(e) => {
              const val = e.target.value;
              setHtmlValue(val);
              onChange(val);
            }}
            placeholder="Write HTML content here..."
            className="w-full min-h-[350px] p-4 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed border-0 focus:outline-none focus:ring-0 resize-y"
            dir="ltr"
          />
        ) : (
          <>
            {placeholder && !editor.getText() && (
              <div
                className="absolute top-4 left-4 text-foreground-muted pointer-events-none select-none text-sm"
              >
                {placeholder}
              </div>
            )}
            <EditorContent editor={editor} />
          </>
        )}
      </div>
    </div>
  );
}
