"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Linkedin, Mail, Send, Share2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

const TwitterX = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

function Whatsapp(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function Pinterest(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.188 0 7.423 2.977 7.423 6.947 0 4.156-2.617 7.508-6.255 7.508-1.22 0-2.368-.63-2.763-1.382l-.752 2.868c-.272 1.043-1.002 2.35-1.492 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.605 0 12.017 0z" />
        </svg>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShareSettings {
    share_enabled: string;
    share_position: "left" | "right";
    share_platforms: string[];
    icon_style: "rounded-square" | "circle" | "flat" | "minimal";
    icon_size: number;
    color_scheme: "brand" | "monochrome" | "custom";
    custom_bg_color: string;
    custom_fill_color: string;
    sidebar_vertical: "top" | "center" | "bottom";
    show_labels: string;
    open_behavior: "new_tab" | "same_tab";
    hide_on_scroll: string;
    delay_ms: number;
    exclude_pages: string;
    url_to_share: "current" | "custom";
    custom_url: string;
    utm_enabled: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    track_clicks: string;
    ga_event_name: string;
}

// ─── Platform map ─────────────────────────────────────────────────────────────

const PLATFORMS: Record<string, {
    label: string;
    icon: any;
    color: string;
    buildUrl: (url: string, title: string) => string;
}> = {
    facebook: { label: "Facebook", icon: FacebookLogo, color: "#3b5998", buildUrl: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    twitter: { label: "X", icon: TwitterX, color: "#000000", buildUrl: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    whatsapp: { label: "WhatsApp", icon: Whatsapp, color: "#25D366", buildUrl: (u, t) => `https://api.whatsapp.com/send?text=${t}%20${u}` },
    linkedin: { label: "LinkedIn", icon: Linkedin, color: "#007bb5", buildUrl: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    pinterest: { label: "Pinterest", icon: Pinterest, color: "#cb2027", buildUrl: (u, t) => `https://pinterest.com/pin/create/button/?url=${u}&description=${t}` },
    telegram: { label: "Telegram", icon: Send, color: "#0088cc", buildUrl: (u, t) => `https://t.me/share/url?url=${u}&text=${t}` },
    email: { label: "Email", icon: Mail, color: "#6b7280", buildUrl: (u, t) => `mailto:?subject=${t}&body=${u}` },
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: ShareSettings = {
    share_enabled: "false",
    share_position: "left",
    share_platforms: ["facebook", "whatsapp", "twitter", "email", "linkedin"],
    icon_style: "rounded-square",
    icon_size: 40,
    color_scheme: "brand",
    custom_bg_color: "#333333",
    custom_fill_color: "#ffffff",
    sidebar_vertical: "center",
    show_labels: "false",
    open_behavior: "new_tab",
    hide_on_scroll: "false",
    delay_ms: 0,
    exclude_pages: "",
    url_to_share: "current",
    custom_url: "",
    utm_enabled: "false",
    utm_source: "",
    utm_medium: "social_share",
    utm_campaign: "",
    track_clicks: "false",
    ga_event_name: "share_click",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildShareUrl(raw: string, cfg: ShareSettings): string {
    try {
        const url = new URL(raw);
        if (cfg.utm_enabled === "true") {
            if (cfg.utm_source) url.searchParams.set("utm_source", cfg.utm_source);
            if (cfg.utm_medium) url.searchParams.set("utm_medium", cfg.utm_medium);
            if (cfg.utm_campaign) url.searchParams.set("utm_campaign", cfg.utm_campaign);
        }
        return encodeURIComponent(url.toString());
    } catch {
        return encodeURIComponent(raw);
    }
}

function itemBorderRadius(
    style: string,
    isLeft: boolean,
    idx: number,
    total: number,
): string {
    if (style === "circle") return "50%";
    if (style === "flat" || style === "minimal") return "0";
    const r = "8px";
    if (isLeft) {
        if (idx === 0 && total === 1) return `0 ${r} ${r} 0`;
        if (idx === 0) return `0 ${r} 0 0`;
        if (idx === total - 1) return `0 0 ${r} 0`;
    } else {
        if (idx === 0 && total === 1) return `${r} 0 0 ${r}`;
        if (idx === 0) return `${r} 0 0 0`;
        if (idx === total - 1) return `0 0 0 ${r}`;
    }
    return "0";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ShareSidebar() {
    const [cfg, setCfg] = useState<ShareSettings>(DEFAULTS);
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();
    const lastScrollY = useRef(0);
    const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch settings
    useEffect(() => {
        fetch("/api/settings")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) return;
                const st = data.settings?.share_tools || {};
                setCfg({
                    share_enabled: st.share_enabled ?? DEFAULTS.share_enabled,
                    share_position: (st.share_position ?? DEFAULTS.share_position) as "left" | "right",
                    share_platforms: st.share_platforms ? JSON.parse(st.share_platforms) : DEFAULTS.share_platforms,
                    icon_style: (st.icon_style ?? DEFAULTS.icon_style) as ShareSettings["icon_style"],
                    icon_size: st.icon_size ? parseInt(st.icon_size) : DEFAULTS.icon_size,
                    color_scheme: (st.color_scheme ?? DEFAULTS.color_scheme) as ShareSettings["color_scheme"],
                    custom_bg_color: st.custom_bg_color ?? DEFAULTS.custom_bg_color,
                    custom_fill_color: st.custom_fill_color ?? DEFAULTS.custom_fill_color,
                    sidebar_vertical: (st.sidebar_vertical ?? DEFAULTS.sidebar_vertical) as ShareSettings["sidebar_vertical"],
                    show_labels: st.show_labels ?? DEFAULTS.show_labels,
                    open_behavior: (st.open_behavior ?? DEFAULTS.open_behavior) as ShareSettings["open_behavior"],
                    hide_on_scroll: st.hide_on_scroll ?? DEFAULTS.hide_on_scroll,
                    delay_ms: st.delay_ms ? parseInt(st.delay_ms) : DEFAULTS.delay_ms,
                    exclude_pages: st.exclude_pages ?? DEFAULTS.exclude_pages,
                    url_to_share: (st.url_to_share ?? DEFAULTS.url_to_share) as "current" | "custom",
                    custom_url: st.custom_url ?? DEFAULTS.custom_url,
                    utm_enabled: st.utm_enabled ?? DEFAULTS.utm_enabled,
                    utm_source: st.utm_source ?? DEFAULTS.utm_source,
                    utm_medium: st.utm_medium ?? DEFAULTS.utm_medium,
                    utm_campaign: st.utm_campaign ?? DEFAULTS.utm_campaign,
                    track_clicks: st.track_clicks ?? DEFAULTS.track_clicks,
                    ga_event_name: st.ga_event_name ?? DEFAULTS.ga_event_name,
                });
            })
            .catch(() => { });
    }, []);

    // Delay before showing
    useEffect(() => {
        if (cfg.share_enabled !== "true") { setVisible(false); return; }
        if (delayTimer.current) clearTimeout(delayTimer.current);
        delayTimer.current = setTimeout(() => setVisible(true), cfg.delay_ms);
        return () => { if (delayTimer.current) clearTimeout(delayTimer.current); };
    }, [cfg.share_enabled, cfg.delay_ms]);

    // Hide on scroll down
    const handleScroll = useCallback(() => {
        if (cfg.hide_on_scroll !== "true") return;
        const y = window.scrollY;
        if (y > lastScrollY.current && y > 100) {
            setVisible(false);
        } else {
            setVisible(true);
        }
        lastScrollY.current = y;
    }, [cfg.hide_on_scroll]);

    useEffect(() => {
        if (cfg.hide_on_scroll !== "true") return;
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll, cfg.hide_on_scroll]);

    // Guards
    const excluded = cfg.exclude_pages.split(",").map((p) => p.trim()).filter(Boolean);
    const isExcluded = excluded.some((p) => pathname === p || pathname.startsWith(p));

    if (cfg.share_enabled !== "true") return null;
    if (!visible) return null;
    if (isExcluded) return null;
    if (pathname.startsWith("/sitemanager")) return null;

    // Share handler
    const handleShare = (platformId: string) => {
        const rawUrl =
            cfg.url_to_share === "custom" && cfg.custom_url
                ? cfg.custom_url
                : window.location.href;
        const title = encodeURIComponent(document.title);
        const finalUrl = buildShareUrl(rawUrl, cfg);
        const platform = PLATFORMS[platformId];
        if (!platform) return;

        if (cfg.track_clicks === "true" && (window as any).gtag) {
            (window as any).gtag("event", cfg.ga_event_name || "share_click", {
                method: platformId,
                content_type: "page",
                item_id: rawUrl,
            });
        }

        const shareUrl = platform.buildUrl(finalUrl, title);
        if (platformId === "email" || cfg.open_behavior === "same_tab") {
            window.location.href = shareUrl;
        } else {
            window.open(shareUrl, "_blank", "width=640,height=480,noopener,noreferrer");
        }
    };

    // Styling
    const isLeft = cfg.share_position === "left";
    const size = cfg.icon_size;
    const iconStyle = cfg.icon_style;
    const showLabels = cfg.show_labels === "true";
    const activePlatforms = cfg.share_platforms.filter((id) => PLATFORMS[id]);

    const getIconBg = (id: string): string => {
        if (iconStyle === "minimal") return "transparent";
        if (cfg.color_scheme === "monochrome") return "#1f2937";
        if (cfg.color_scheme === "custom") return cfg.custom_bg_color;
        return PLATFORMS[id]?.color ?? "#555";
    };

    const getIconFill = (id: string): string => {
        if (cfg.color_scheme === "custom") return cfg.custom_fill_color;
        if (cfg.color_scheme === "monochrome") return "#ffffff";
        if (iconStyle === "minimal") return PLATFORMS[id]?.color ?? "#555";
        return "#ffffff";
    };

    // Position: flush to edge (0px gap), vertical by config
    const positionStyle: React.CSSProperties = {
        [cfg.share_position]: 0,
        ...(cfg.sidebar_vertical === "top"
            ? { top: "15%" }
            : cfg.sidebar_vertical === "bottom"
                ? { bottom: "15%" }
                : { top: "50%", transform: "translateY(-50%)" }),
    };

    return (
        <div
            className={cn(
                "fixed z-50 flex flex-col transition-all duration-500",
                visible
                    ? "opacity-100 translate-x-0"
                    : isLeft
                        ? "-translate-x-full opacity-0"
                        : "translate-x-full opacity-0",
            )}
            style={positionStyle}
            role="complementary"
            aria-label="Share tools"
        >
            <div
                className="flex flex-col"
                style={{
                    boxShadow: isLeft
                        ? "4px 0 24px rgba(0,0,0,0.3)"
                        : "-4px 0 24px rgba(0,0,0,0.3)",
                }}
            >
                {activePlatforms.map((id, idx) => {
                    const platform = PLATFORMS[id];
                    if (!platform) return null;
                    const Icon = platform.icon;
                    const bg = getIconBg(id);
                    const fill = getIconFill(id);
                    const br = itemBorderRadius(iconStyle, isLeft, idx, activePlatforms.length);

                    return (
                        <button
                            key={id}
                            onClick={() => handleShare(id)}
                            title={`Share on ${platform.label}`}
                            aria-label={`Share on ${platform.label}`}
                            className="relative group flex items-center justify-center border-b border-black/10 last:border-0 transition-all duration-150 hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            style={{
                                width: size,
                                height: size,
                                backgroundColor: bg,
                                color: fill,
                                borderRadius: br,
                                boxSizing: "border-box",
                            }}
                        >
                            <Icon style={{ width: size * 0.45, height: size * 0.45, flexShrink: 0 } as any} />

                            {/* Hover tooltip (when labels off) */}
                            {!showLabels && (
                                <span
                                    className={cn(
                                        "absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10",
                                        "whitespace-nowrap text-[11px] font-medium text-white bg-black/80 rounded px-2 py-1 pointer-events-none shadow-xl",
                                    )}
                                    style={isLeft ? { left: size + 6 } : { right: size + 6 }}
                                >
                                    {platform.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}