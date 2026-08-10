import Link from "next/link";
import { LogOut } from "lucide-react";
import AdminSidebarClient from "./AdminSidebarClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Server + Client Interaction) */}
      <aside className="w-64 bg-white text-gray-800 border-r border-gray-200 flex-shrink-0 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-sm hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <img src="/logo.png" alt="Atanıyorum Hocam Logo" className="h-10 w-auto object-contain" />
        </div>
        
        <div className="flex-grow overflow-y-auto py-2">
          <AdminSidebarClient />
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="font-semibold text-gray-800">Yönetim Paneli</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-grow p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
