import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			// ── Colors (all driven by CSS variables in globals.css) ──────────────
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				"foreground-muted": "var(--foreground-muted)",
				"foreground-light": "var(--foreground-light)",
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
					light: "var(--primary-light)",
					dark: "var(--primary-dark)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
					blue: "var(--accent-blue)",
					"blue-hover": "var(--accent-blue-hover)",
					"blue-light": "var(--accent-blue-light)",
					gold: "var(--accent-gold)",
					"gold-dark": "var(--accent-gold-dark)",
				},
				destructive: {
					DEFAULT: "var(--destructive)",
					foreground: "var(--destructive-foreground)",
				},
				border: "var(--border)",
				"border-strong": "var(--border-strong)",
				input: "var(--input)",
				ring: "var(--ring)",
				// Social brand colors
				facebook: "var(--color-facebook)",
				whatsapp: "var(--color-whatsapp)",
				youtube: "var(--color-youtube)",
				linkedin: "var(--color-linkedin)",
				// Chart
				chart: {
					"1": "var(--chart-1)",
					"2": "var(--chart-2)",
					"3": "var(--chart-3)",
					"4": "var(--chart-4)",
					"5": "var(--chart-5)",
				},
			},

			// ── Font Families ─────────────────────────────────────────────────────
			fontFamily: {
				heading: ["var(--font-heading)", "system-ui", "sans-serif"],
				body: ["var(--font-body)", "Arial", "Helvetica", "sans-serif"],
				amiri: ["var(--font-amiri)", "Amiri", "serif"],
				nastaleeq: ["Jameel Noori Nastaleeq", "serif"],
				sans: ["var(--font-body)", "Arial", "Helvetica", "sans-serif"],
			},

			// ── Border Radius ─────────────────────────────────────────────────────
			// Base --radius is 0.625rem (10px). Extended scale matches extraction.
			borderRadius: {
				sm: "calc(var(--radius) - 4px)",
				md: "calc(var(--radius) - 2px)",
				lg: "var(--radius)",                  // 10px
				xl: "calc(var(--radius) + 4px)",
				"2xl": "var(--radius-card)",             // 20px
				"3xl": "var(--radius-card-md)",          // 25px
				pill: "var(--radius-pill)",             // 50px
				circle: "var(--radius-circle)",           // 80px
				full: "9999px",
			},

			// ── Box Shadows (extracted from tanzeem.org) ──────────────────────────
			boxShadow: {
				low: "var(--shadow-low)",
				mid: "var(--shadow-mid)",
				"mid-blue": "var(--shadow-mid2)",
				"mid-soft": "var(--shadow-mid3)",
				deep: "var(--shadow-deep)",
				"card-hover": "var(--shadow-card-hover)",
			},

			// ── Spacing (10px base scale) ─────────────────────────────────────────
			spacing: {
				"2.5": "0.625rem",   // 10px
				"3.75": "0.9375rem",  // 15px
				"7.5": "1.875rem",   // 30px
				"12.5": "3.125rem",   // 50px
			},
		},
	},
	plugins: [tailwindcssAnimate],
};

export default config;
