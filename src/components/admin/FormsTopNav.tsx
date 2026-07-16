"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Inbox, Send, Settings, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormsTopNav({ rightElement }: { rightElement?: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "ALL FORMS", href: "/sitemanager/forms", icon: LayoutGrid },
    { name: "INBOX", href: "/sitemanager/forms/inbox", icon: Inbox, badge: true },
    { name: "SENT HISTORY", href: "/sitemanager/forms/history", icon: Send },
    { name: "EMAIL CONFIGURATIONS", href: "/sitemanager/forms/email-configurations", icon: Settings },
    { name: "EMAIL LOGS", href: "/sitemanager/forms/logs", icon: History },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-6">
      <div className="flex items-center overflow-x-auto w-full lg:w-auto no-scrollbar gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-widest transition-all whitespace-nowrap",
                isActive
                  ? "bg-blue-50 text-[#1a4b6b]"
                  : "text-slate-400 hover:text-foreground hover:bg-slate-50"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-[#1a4b6b]" : "text-slate-400")} />
              {tab.name}
              {tab.badge && isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
              )}
            </Link>
          );
        })}
      </div>

      {rightElement && (
        <div className="flex items-center gap-3 w-full lg:w-auto px-2 lg:px-0">
          {rightElement}
        </div>
      )}
    </div>
  );
}
