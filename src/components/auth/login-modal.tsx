"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  function mockLogin() {
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Téged is érint?</DialogTitle>
          <DialogDescription>
            Jelentkezz be, hogy támogatni tudd ezt az ügyet.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {[
            "Facebook",
            "Google",
            "Apple",
            "Email",
          ].map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={mockLogin}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}
            >
              Folytatás {provider} fiókkal
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
