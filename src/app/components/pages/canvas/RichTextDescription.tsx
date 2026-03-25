import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Highlighter,
  Type,
  X,
} from 'lucide-react';

interface RichTextDescriptionProps {
  content: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChange: (html: string) => void;
  placeholder?: string;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#fef08a' },
  { name: 'Green', color: '#bbf7d0' },
  { name: 'Blue', color: '#bfdbfe' },
  { name: 'Pink', color: '#fbcfe8' },
];

const TEXT_COLORS = [
  { name: 'Default', color: '' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#2F80ED' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Gray', color: '#6b7280' },
];

export function RichTextDescription({
  content,
  isEditing,
  onStartEdit,
  onStopEdit,
  onChange,
  placeholder = 'Enter description',
}: RichTextDescriptionProps) {
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rt-link' },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    editable: isEditing,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const isEmpty = html === '<p></p>' || html === '';
      onChange(isEmpty ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'rt-editor-content',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Escape' || (event.key === 'Enter' && (event.ctrlKey || event.metaKey))) {
          onStopEdit();
          return true;
        }
        // Stop all key events from bubbling to canvas hotkeys
        event.stopPropagation();
        return false;
      },
    },
  });

  // Sync editable state and nodrag class
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
      const el = editor.view.dom;
      if (isEditing) {
        el.classList.add('nodrag');
        setTimeout(() => editor.commands.focus('end'), 10);
      } else {
        el.classList.remove('nodrag');
        setShowHighlightPicker(false);
        setShowColorPicker(false);
        setShowLinkInput(false);
      }
    }
  }, [isEditing, editor]);

  // Sync content from external changes (e.g. language switch)
  const lastExternalContent = useRef(content);
  useEffect(() => {
    if (editor && content !== lastExternalContent.current) {
      lastExternalContent.current = content;
      const currentHTML = editor.getHTML();
      const normalizedCurrent = currentHTML === '<p></p>' ? '' : currentHTML;
      if (content !== normalizedCurrent) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  // Track content changes from editor
  useEffect(() => {
    if (editor) {
      const handler = () => {
        const html = editor.getHTML();
        lastExternalContent.current = html === '<p></p>' ? '' : html;
      };
      editor.on('update', handler);
      return () => { editor.off('update', handler); };
    }
  }, [editor]);

  // Click outside to stop editing
  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (editorContainerRef.current && !editorContainerRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false);
        setShowColorPicker(false);
        setShowLinkInput(false);
        onStopEdit();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, onStopEdit]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href || '';
    setLinkUrl(existing);
    setShowLinkInput(true);
    setShowHighlightPicker(false);
    setShowColorPicker(false);
    setTimeout(() => linkInputRef.current?.focus(), 10);
  }, [editor]);

  if (!editor) return null;

  return (
    <div ref={editorContainerRef} className="rt-description-wrapper w-full min-h-[28px]">
      {/* Fixed Toolbar — space always reserved, visible only when editing */}
        <div className={`rt-fixed-toolbar nodrag ${isEditing ? '' : 'rt-toolbar-hidden'}`} onMouseDown={(e) => e.preventDefault()}>
          {showLinkInput ? (
            <div className="rt-link-input-row">
              <input
                ref={linkInputRef}
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') applyLink();
                  if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); editor.commands.focus(); }
                }}
                placeholder="Enter URL..."
                className="rt-link-input"
              />
              <button className="rt-bubble-btn" onClick={applyLink} title="Apply">
                <span style={{ fontSize: 10, fontWeight: 600 }}>OK</span>
              </button>
              {editor.isActive('link') && (
                <button
                  className="rt-bubble-btn"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                  title="Remove link"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ) : (
            <div className="rt-bubble-btn-row">
              <button
                className={`rt-bubble-btn ${editor.isActive('bold') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold (Ctrl+B)"
              >
                <Bold size={11} />
              </button>
              <button
                className={`rt-bubble-btn ${editor.isActive('italic') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic (Ctrl+I)"
              >
                <Italic size={11} />
              </button>
              <button
                className={`rt-bubble-btn ${editor.isActive('underline') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon size={11} />
              </button>
              <button
                className={`rt-bubble-btn ${editor.isActive('strike') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
              >
                <Strikethrough size={11} />
              </button>
              <div className="rt-bubble-sep" />
              <button
                className={`rt-bubble-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
              >
                <Heading2 size={11} />
              </button>
              <button
                className={`rt-bubble-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Heading 3"
              >
                <Heading3 size={11} />
              </button>
              <div className="rt-bubble-sep" />
              <button
                className={`rt-bubble-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
              >
                <List size={11} />
              </button>
              <button
                className={`rt-bubble-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
              >
                <ListOrdered size={11} />
              </button>
              <div className="rt-bubble-sep" />
              <button
                className={`rt-bubble-btn ${editor.isActive('link') ? 'active' : ''}`}
                onClick={openLinkInput}
                title="Link"
              >
                <LinkIcon size={11} />
              </button>
              <div className="rt-highlight-wrapper">
                <button
                  className={`rt-bubble-btn ${editor.isActive('highlight') ? 'active' : ''}`}
                  onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
                  title="Highlight"
                >
                  <Highlighter size={11} />
                </button>
                {showHighlightPicker && (
                  <div className="rt-highlight-picker" onMouseDown={(e) => e.preventDefault()}>
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c.color}
                        className="rt-highlight-swatch"
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                        onClick={() => {
                          editor.chain().focus().toggleHighlight({ color: c.color }).run();
                          setShowHighlightPicker(false);
                        }}
                      />
                    ))}
                    {editor.isActive('highlight') && (
                      <button
                        className="rt-highlight-swatch rt-highlight-remove"
                        title="Remove highlight"
                        onClick={() => {
                          editor.chain().focus().unsetHighlight().run();
                          setShowHighlightPicker(false);
                        }}
                      >
                        <X size={8} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="rt-highlight-wrapper">
                <button
                  className={`rt-bubble-btn ${editor.isActive('textStyle') ? 'active' : ''}`}
                  onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
                  title="Text Color"
                >
                  <Type size={11} />
                </button>
                {showColorPicker && (
                  <div className="rt-highlight-picker" onMouseDown={(e) => e.preventDefault()}>
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c.color || 'default'}
                        className="rt-highlight-swatch rt-color-swatch"
                        style={{ backgroundColor: c.color || 'var(--muted)' }}
                        title={c.name}
                        onClick={() => {
                          if (c.color) {
                            editor.chain().focus().setColor(c.color).run();
                          } else {
                            editor.chain().focus().unsetColor().run();
                          }
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      {/* Editor / Display */}
      <div
        onDoubleClick={() => {
          if (!isEditing) onStartEdit();
        }}
        className={isEditing ? 'cursor-text' : 'canvas-field-hover cursor-grab'}
      >
        {!isEditing && !content ? (
          <div className="rt-empty-placeholder">{placeholder}</div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}
