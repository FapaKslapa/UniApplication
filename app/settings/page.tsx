"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AdminLoginDialog } from "@/components/admin/AdminLoginDialog";
import { SettingsDesktop } from "@/components/settings/desktop/SettingsDesktop";
import { SettingsMobile } from "@/components/settings/SettingsMobile";
import { useCourseDraft } from "@/components/settings/useCourseDraft";
import { useSubjectVisibility } from "@/components/settings/useSubjectVisibility";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/lib/store";
import { useMediaQuery } from "@/lib/useMediaQuery";

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { isAdmin, setIsAdmin } = useAppStore();

  const [error, setError] = useState<string | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const draft = useCourseDraft({ onEdit: () => setError(null) });
  const visibility = useSubjectVisibility();

  const shared = {
    isSetup,
    isAdmin,
    draft,
    visibility,
    error,
    setError,
    onOpenAdmin: () => setIsAdminLoginOpen(true),
    onLogoutAdmin: async () => {
      await authClient.signOut();
      setIsAdmin(false);
    },
  };

  return (
    <>
      {isDesktop ? (
        <SettingsDesktop {...shared} />
      ) : (
        <SettingsMobile {...shared} />
      )}
      <AdminLoginDialog
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => router.push("/?view=stats")}
      />
    </>
  );
}
