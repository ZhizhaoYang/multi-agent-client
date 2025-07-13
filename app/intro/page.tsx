import fs from 'fs';
import path from 'path';

import ReactMarkdown from 'react-markdown';

import { title } from "@/components/primitives";

export default function IntroPage() {
  // Read markdown content from file at build time (SSR)
  const markdownContent = fs.readFileSync(
    path.join(process.cwd(), 'content/intro.md'),
    'utf8'
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className={title({ color: "blue" })}>Project Introduction</h1>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
}