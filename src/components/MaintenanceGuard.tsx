"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import MaintenanceView from "./MaintenanceView";

interface MaintenanceGuardProps {
  children: React.ReactNode;
  initialSettings?: {
    isMaintenance: boolean;
    maintenanceImage?: string | null;
    maintenanceTitle?: string | null;
    maintenanceDesc?: string | null;
  };
}

export default function MaintenanceGuard({ children, initialSettings }: MaintenanceGuardProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [settings, setSettings] = useState(initialSettings || null);

  useEffect(() => {
    // Fetch latest settings periodically or on route change
    const checkSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Settings check error:", err);
      }
    };

    checkSettings();
  }, [pathname]);

  // Bypass paths (Admin panel, Login page, API routes)
  const isBypassPath = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/auth/login") || 
    pathname.startsWith("/api/");

  // Bypass for Admin Users
  const isAdminUser = session?.user?.role === "ADMIN";

  // If maintenance mode is active AND path is not bypassed AND user is not admin
  if (settings?.isMaintenance && !isBypassPath && !isAdminUser) {
    return (
      <MaintenanceView 
        image={settings.maintenanceImage} 
        title={settings.maintenanceTitle} 
        desc={settings.maintenanceDesc} 
      />
    );
  }

  return <>{children}</>;
}
