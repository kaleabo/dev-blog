import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Ethiopian Dev Blog",
  description: "Manage your blog posts and profile.",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
} 