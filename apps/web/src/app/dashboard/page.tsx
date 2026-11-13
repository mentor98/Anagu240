"use client";
/**
 * Dashboard — role-based redirect hub.
 * Routes each role to their specific dashboard on login.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const ROLE_HOME: Record<string, string> = {
  CITIZEN:            "/citizen/dashboard",
  SURVEYOR:           "/surveyor/dashboard",
  REGISTRAR:          "/registrar/dashboard",
  LAND_ADMINISTRATOR: "/land-admin/dashboard",
  GOVERNOR:           "/governor/dashboard",
  SYSTEM:             "/admin/dashboard",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const dest = ROLE_HOME[user.role] ?? "/citizen/dashboard";
    router.replace(dest);
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-midnight)" }}>
      <PageLoader label="Redirecting to your dashboard…" />
    </div>
  );
}
