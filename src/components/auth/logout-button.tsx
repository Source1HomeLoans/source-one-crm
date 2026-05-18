"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button variant="ghost" className="h-10 w-10 px-0" aria-label="Sign out" disabled={loading} onClick={logout}>
      <LogOut size={18} />
    </Button>
  );
}
