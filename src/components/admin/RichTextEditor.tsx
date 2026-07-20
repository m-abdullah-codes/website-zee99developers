"use client";

import { useEffect, useRef } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

/** tiptap-markdown augments editor.storage but ships no ambient types for it. */
type MarkdownStorage = { markdown: { getMarkdown: () => string } };
const getMarkdown = (editor: Editor) =>
  (editor.storage as unknown as MarkdownStorage).markdown.getMarkdown();

// tiptap-markdown 0.9 serializes a block image without a trailing block break,
// so anything typed after an image glues onto its line (and breaks a following
// table). Give the image node its own serializer that closes the block.
type MdSerializerState = {
  esc: (s: string) => string;
  write: (s: string) => void;
  closeBlock: (node: unknown) => void;
};
type ImageNode = { attrs: { src?: string; alt?: string; title?: string } };
const BlockImage = Image.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: MdSerializerState, node: ImageNode) {
          const alt = state.esc(node.attrs.alt ?? "");
          const src = node.attrs.src ?? "";
          const title = node.attrs.title ? ` ${JSON.stringify(node.attrs.title)}` : "";
          state.write(`![${alt}](${src}${title})`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});

/**
 * WYSIWYG post-body editor. Speaks markdown at its edges — `value`/`onChange`
 * are the same markdown string the raw editor and the public site use — so a
 * writer can switch between "write normally" (here) and raw markdown with no
 * data loss. The editable surface carries `.prose-z`, so it looks like the
 * published article as you type.
 */
export function RichTextEditor({
  value,
  onChange,
  onRequestImage,
  className,
}: {
  value: string;
  onChange: (markdown: string) => void;
  /** Opens the media library; resolves with a chosen image (or null if cancelled). */
  onRequestImage: () => Promise<{ url: string; alt: string } | null>;
  className?: string;
}) {
  // Tracks the last markdown WE emitted, so echoing `value` back doesn't reset
  // the doc (which would jump the caret). External changes — mode switch, media
  // insert from outside — differ from this and DO re-seed the editor.
  const lastEmit = useRef<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
        dropcursor: { color: "#c29d55", width: 2 },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      BlockImage.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({
        placeholder: "Write your post here — select text to format, or use the toolbar above.",
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    editorProps: { attributes: { class: "prose-z", spellcheck: "true" } },
    onUpdate: ({ editor }) => {
      const md = getMarkdown(editor);
      lastEmit.current = md;
      onChange(md);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastEmit.current) return;
    // tiptap-markdown intercepts setContent and parses the string as markdown.
    editor.commands.setContent(value, { emitUpdate: false });
    lastEmit.current = value;
  }, [editor, value]);

  return (
    <div className={className}>
      <Toolbar editor={editor} onRequestImage={onRequestImage} />
      <div className="z99-rich">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- toolbar */
function TB({
  label,
  title,
  active,
  disabled,
  onClick,
  className,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor selection — losing focus before the handler would drop it.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-[32px] items-center justify-center px-2 font-mono text-[11px] leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        active
          ? "bg-ink text-paper"
          : "border border-ink/15 text-ink-2 hover:border-ink/40 hover:text-ink",
        className,
      )}
    >
      {label}
    </button>
  );
}

const Divider = () => <span className="mx-0.5 hidden w-px self-stretch bg-ink/10 sm:block" />;

function Toolbar({
  editor,
  onRequestImage,
}: {
  editor: Editor | null;
  onRequestImage: () => Promise<{ url: string; alt: string } | null>;
}) {
  // Reactive snapshot of the marks/nodes under the cursor, so buttons light up.
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            code: e.isActive("code"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            table: e.isActive("table"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor || !s) {
    // Placeholder bar keeps layout stable until the editor mounts (client-only).
    return <div className="mb-2 h-8" aria-hidden />;
  }

  const chain = () => editor.chain().focus();

  const setLink = () => {
    if (s.link) return chain().unsetLink().run();
    const url = window.prompt("Link URL", "https://");
    if (url === null) return;
    if (url === "") return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      // No selection — insert the URL as its own linked text.
      chain().insertContent(url).run();
      const end = editor.state.selection.to;
      chain().setTextSelection({ from: end - url.length, to: end }).setLink({ href: url }).run();
    } else {
      chain().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const insertImage = async () => {
    const picked = await onRequestImage();
    if (picked) chain().setImage({ src: picked.url, alt: picked.alt }).run();
  };

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1">
      <TB label="↶" title="Undo" disabled={!s.canUndo} onClick={() => chain().undo().run()} />
      <TB label="↷" title="Redo" disabled={!s.canRedo} onClick={() => chain().redo().run()} />
      <Divider />
      <TB label="B" title="Bold" className="font-bold" active={s.bold} onClick={() => chain().toggleBold().run()} />
      <TB label="I" title="Italic" className="italic" active={s.italic} onClick={() => chain().toggleItalic().run()} />
      <TB label="</>" title="Inline code" active={s.code} onClick={() => chain().toggleCode().run()} />
      <Divider />
      <TB label="H2" title="Heading 2" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <TB label="H3" title="Heading 3" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      <TB label="Quote" title="Blockquote" active={s.quote} onClick={() => chain().toggleBlockquote().run()} />
      <TB label="List" title="Bullet list" active={s.bullet} onClick={() => chain().toggleBulletList().run()} />
      <TB label="1. List" title="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()} />
      <Divider />
      <TB label="Link" title="Add / remove link" active={s.link} onClick={setLink} />
      <TB label="Image" title="Insert image from library" onClick={() => void insertImage()} />
      <TB
        label="Table"
        title="Insert table"
        active={s.table}
        onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      />

      {s.table && (
        <div className="mt-1 flex w-full flex-wrap items-center gap-1 border-t border-ink/10 pt-2">
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-2/70">
            Table
          </span>
          <TB label="+Row" title="Add row below" onClick={() => chain().addRowAfter().run()} />
          <TB label="−Row" title="Delete row" onClick={() => chain().deleteRow().run()} />
          <TB label="+Col" title="Add column right" onClick={() => chain().addColumnAfter().run()} />
          <TB label="−Col" title="Delete column" onClick={() => chain().deleteColumn().run()} />
          <TB label="Header" title="Toggle header row" onClick={() => chain().toggleHeaderRow().run()} />
          <TB
            label="Delete table"
            title="Delete table"
            className="text-red-900/70 hover:text-red-900"
            onClick={() => chain().deleteTable().run()}
          />
        </div>
      )}
    </div>
  );
}
