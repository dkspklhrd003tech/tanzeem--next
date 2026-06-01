"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
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
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
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
}: RichTextEditorProps) {
  // RTL state — persists direction for the editor surface
  const [isRTL, setIsRTL] = useState(() => {
    // Auto-detect Urdu/Arabic characters in initial content
    if (!content) return false;
    const stripped = content.replace(/<[^>]+>/g, "");
    return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(stripped);
  });

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
        defaultAlignment: isRTL ? "right" : "left",
      }),
      TextStyle,
      Color,
      Image,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-foreground",
          className
        ),
        dir: isRTL ? "rtl" : "ltr",
        style: isRTL ? "font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif; line-height: 2.2;" : "",
      },
    },
  });

  if (!editor) return null;

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

  const toggleRTL = () => {
    const newRTL = !isRTL;
    setIsRTL(newRTL);
    // Apply the direction attribute live
    const editorEl = editor.view.dom as HTMLElement;
    editorEl.setAttribute("dir", newRTL ? "rtl" : "ltr");
    if (newRTL) {
      editorEl.style.fontFamily = "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif";
      editorEl.style.lineHeight = "2.2";
      // Switch alignment to right for Urdu
      editor.chain().focus().setTextAlign("right").run();
    } else {
      editorEl.style.fontFamily = "";
      editorEl.style.lineHeight = "";
      editor.chain().focus().setTextAlign("left").run();
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b border-border">
        {/* RTL / LTR Direction Toggle — prominently at start of toolbar */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleRTL}
                className={cn(
                  "h-8 px-2.5 rounded-md text-xs font-bold tracking-wide transition-all border",
                  isRTL
                    ? "bg-amber-500/20 text-amber-700 border-amber-400/50 hover:bg-amber-500/30"
                    : "bg-muted text-foreground-muted border-border hover:bg-muted/80"
                )}
              >
                {isRTL ? "اردو RTL" : "LTR"}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isRTL ? "Switch to Left-to-Right (English)" : "Switch to Right-to-Left (Urdu/Arabic)"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
      </div>

      {/* RTL Mode Indicator Banner */}
      {isRTL && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2">
          <span className="text-amber-700 text-xs font-semibold">اردو/عربی موڈ فعال</span>
          <span className="text-amber-600 text-xs">— Urdu/Arabic RTL mode active. Text flows right-to-left.</span>
        </div>
      )}

      {/* Editor Surface */}
      <div className="relative">
        {placeholder && !editor.getText() && (
          <div
            className={cn(
              "absolute top-4 text-foreground-muted pointer-events-none select-none text-sm",
              isRTL ? "right-4" : "left-4"
            )}
          >
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
