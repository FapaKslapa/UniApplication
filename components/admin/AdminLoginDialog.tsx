"use client";

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DrawerHeading } from "@/components/ui/drawer-heading";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/lib/store";

type AdminLoginDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AdminLoginDialog({
  isOpen,
  onClose,
  onSuccess,
}: AdminLoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const setIsAdmin = useAppStore((state) => state.setIsAdmin);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message ?? "Credenziali non corrette");
        return;
      }

      setIsAdmin(true);
      setEmail("");
      setPassword("");
      onSuccess?.();
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-popover">
        <DrawerHeading
          icon={ShieldCheck}
          title="Pannello admin"
          description="Accesso riservato"
        />

        <form onSubmit={handleLogin} className="flex flex-col gap-3 px-5 pb-8">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus
            autoComplete="username"
            className="h-12 bg-card"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="h-12 bg-card pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Nascondi password" : "Mostra password"
              }
              className="absolute top-1/2 right-0.5 size-11 -translate-y-1/2 rounded-full text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
          {error && (
            <p className="text-xs font-semibold text-destructive">{error}</p>
          )}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Accesso..." : "Entra"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
