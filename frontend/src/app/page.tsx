"use client";

import { logout } from "@/entities/user-session";
import { Button } from "@/shared/ui/ui/button";

export default function Home() {
  return <Button onClick={() => logout()}>Logout</Button>;
}
