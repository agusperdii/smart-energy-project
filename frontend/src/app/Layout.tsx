import type { ReactNode } from "react";
import { Sidebar } from "./Components/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-7xl h-full">
          {children}
        </div>
      </main>
    </div>
  );
}