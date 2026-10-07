"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitingPage() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("merx_token");
    if (!storedToken) {
      router.push("/");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  if (!token) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-pulse h-12 w-12 bg-meridian-brand/20 rounded-full flex items-center justify-center mb-6">
        <div className="h-6 w-6 bg-meridian-brand rounded-full"></div>
      </div>
      <h2 className="text-xl font-bold text-meridian-dark">Waiting for organizers...</h2>
      <p className="text-meridian-muted mt-2 text-sm">
        The market session will begin shortly.
      </p>
    </div>
  );
}
