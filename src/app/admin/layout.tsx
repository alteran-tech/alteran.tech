import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticatedServer();

  if (!authed) {
    redirect("/sign-in?redirect_url=/admin");
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar />

      {/* Main content area -- offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
