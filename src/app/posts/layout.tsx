import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts - Ethiopian Dev Blog",
  description: "Read and write blog posts about Ethiopian software development.",
};

interface PostsLayoutProps {
  children: React.ReactNode;
}

export default function PostsLayout({ children }: PostsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
} 