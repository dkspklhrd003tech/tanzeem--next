"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

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

const YoutubeLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import { Separator } from "@/components/ui/separator";
import { resolveMenuLink, EXTERNAL_LINK_REL } from "@/lib/security";
import { useSettings } from "@/hooks/use-settings";
import { useNavigation, type MenuNode } from "@/hooks/use-navigation";

export function Footer() {
  const { settings } = useSettings();
  // Footer columns come entirely from menu_items where menuType='footer'.
  const { items: footerColumns, isLoading } = useNavigation("footer", true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render the social icons that are configured in settings.
  const socials = [
    { key: "facebook_url", url: settings.facebook_url, Icon: FacebookLogo, hover: "hover:bg-[#1877F2]" },
    { key: "twitter_url", url: settings.twitter_url, Icon: TwitterX, hover: "hover:bg-black" },
    { key: "youtube_url", url: settings.youtube_url, Icon: YoutubeLogo, hover: "hover:bg-red-600" },
  ].filter((s) => s.url);

  // Resolve the WhatsApp link from settings (inline SVG so no icon import needed).
  const whatsappUrl = settings.whatsapp_url || null;

  const copyright = (settings.footer_copyright || "").replace(
    "${year}",
    String(new Date().getFullYear()),
  );

  if (!mounted) {
    return <footer className="bg-background-dark min-h-[350px]" />;
  }

  return (
    <footer className="bg-background-dark text-white/70 px-6">
      {/* Main Footer */}
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Dynamic link columns — each top-level footer menu item is a column. */}
          {isLoading || !mounted ? (
            // Skeleton columns while the footer menu loads.
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-24 rounded bg-white/10 mb-4 animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-3 w-32 rounded bg-white/5 animate-pulse" />
                  ))}
                </div>
              </div>
            ))
          ) : footerColumns.length === 0 ? (
            <div className="col-span-full text-center text-white/40 text-sm py-8">
              Footer menu is empty. Run <code className="font-mono">npm run seed:nav</code> to populate it.
            </div>
          ) : (
            footerColumns.map((column) => (
              <FooterColumn key={column.id} column={column} />
            ))
          )}

          {/* Contact Us Column — values from settings, no inline defaults. */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3">
              {settings.footer_address && (
                <div className="flex items-start gap-2.5 text-white text-sm">
                  <MapPin className="h-4 w-4 text-white mt-0.5 shrink-0" />
                  <span className="text-white">{settings.footer_address}</span>
                </div>
              )}
              {settings.footer_landline && (
                <a href={`tel:${settings.footer_landline}`} className="flex items-center gap-2.5 text-white hover:text-primary-foreground transition-colors text-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-sm">
                  <Phone className="h-4 w-4 text-white shrink-0" aria-hidden="true" />
                  <span>{settings.footer_landline}</span>
                </a>
              )}
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                  target="_blank"
                  rel={EXTERNAL_LINK_REL}
                  className="flex items-center gap-2.5 text-white hover:text-primary-foreground transition-colors text-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-sm"
                >
                  <svg className="h-4 w-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span>{settings.whatsapp_number}</span>
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2.5 text-white hover:text-primary-foreground transition-colors text-sm break-all focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-sm">
                  <Mail className="h-4 w-4 text-white shrink-0" aria-hidden="true" />
                  <span>{settings.contact_email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-white/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-sm text-center md:text-left">
            {copyright || `© ${new Date().getFullYear()} Tanzeem-e-Islami. All rights reserved.`}
          </p>

          <div className="flex items-center gap-3">
            {socials.map(({ key, url, Icon, hover }) => (
              <motion.a
                key={key}
                href={url as string}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                aria-label={`${key.split("_")[0]} — opens in new tab`}
                className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white ${hover} hover:text-primary-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </motion.a>
            ))}

            {whatsappUrl && (
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                aria-label="WhatsApp — opens in new tab"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-green-500 hover:text-primary-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * FooterColumn — renders one dynamic column from the footer menu tree.
 * The top-level item's `label` is the column heading; its children are the links.
 */
function FooterColumn({ column }: { column: MenuNode }) {
  const links = column.children ?? [];
  return (
    <div>
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
        {column.label}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const resolved = resolveMenuLink(link.url, link.isOpenInNew);
          if (!resolved.href) return null;
          const content = (
            <span className="text-white hover:underline transition-colors text-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-sm">
              {link.label}
            </span>
          );
          return (
            <li key={link.id}>
              {resolved.isExternal ? (
                <a
                  href={resolved.href}
                  target={resolved.isOpenInNew ? "_blank" : undefined}
                  rel={EXTERNAL_LINK_REL}
                >
                  {content}
                </a>
              ) : (
                <Link href={resolved.href}>{content}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
