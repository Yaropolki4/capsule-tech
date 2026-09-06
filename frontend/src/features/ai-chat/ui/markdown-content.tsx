import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

const markdownComponents: Components = {
  p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-2 first:mt-0 flex flex-col gap-1 list-disc pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 first:mt-0 flex flex-col gap-1 list-decimal pl-4">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 break-words"
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    if (className?.includes("language-")) {
      return <code className={cn("font-mono text-xs", className)}>{children}</code>;
    }

    return (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="mt-2 first:mt-0 rounded-[var(--radius-card)] bg-muted p-3 overflow-x-auto text-xs">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-2 first:mt-0 border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <p className="mt-2 first:mt-0 font-semibold">{children}</p>,
  h2: ({ children }) => <p className="mt-2 first:mt-0 font-semibold">{children}</p>,
  h3: ({ children }) => <p className="mt-2 first:mt-0 font-semibold">{children}</p>,
  hr: () => <hr className="my-2 border-border" />,
};

export function MarkdownContent({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
