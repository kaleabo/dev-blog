"use client";

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  linkPlugin,
  imagePlugin,
} from "@mdxeditor/editor";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXEditor
        markdown={content}
        readOnly
        contentEditableClassName="prose dark:prose-invert max-w-none px-4 py-2"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          tablePlugin(),
          linkPlugin(),
          imagePlugin(),
        ]}
      />
    </div>
  );
} 