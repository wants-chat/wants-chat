import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  className,
  editorClassName,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border border-white/20 rounded-lg overflow-hidden bg-white/5 backdrop-blur-xl', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/20 bg-white/5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10', editor.isActive('bold') && 'bg-white/20 text-white')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10', editor.isActive('italic') && 'bg-white/20 text-white')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn('h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10', editor.isActive('bulletList') && 'bg-white/20 text-white')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn('h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10', editor.isActive('orderedList') && 'bg-white/20 text-white')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm prose-invert max-w-none p-3 min-h-[120px] focus-within:outline-none',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror]:text-white',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-white/40',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          editorClassName
        )}
      />
    </div>
  );
};

export default RichTextEditor;
