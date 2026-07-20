"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function LiveSearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  // Sync state with URL changes (e.g. from Header)
  useEffect(() => {
    const q = searchParams?.get("q");
    if (q !== null && q !== value) {
      setValue(q);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    router.replace(`/search?q=${encodeURIComponent(val.trim())}`);
  };

  return (
    <Input
      name="q"
      value={value}
      onChange={handleChange}
      placeholder="Search resources, topics, or speakers..."
      className="pl-12 h-12 text-md bg-[#fefefc] border-border rounded-xl"
      autoFocus
    />
  );
}
