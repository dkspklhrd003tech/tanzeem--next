import nodemailer from "nodemailer";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Fetches SMTP settings from the database and sends an email.
 */
export async function sendEmail(options: SendEmailOptions) {
    try {
        // Fetch SMTP configuration from the settings table
        const smtpKeys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'smtp_secure'];
        const settingsData = await db.select().from(settings).where(inArray(settings.key, smtpKeys));

        const config = settingsData.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const finalConfig = {
            smtp_host: config.smtp_host || process.env.SMTP_HOST,
            smtp_port: config.smtp_port || process.env.SMTP_PORT,
            smtp_user: config.smtp_user || process.env.SMTP_USER,
            smtp_pass: config.smtp_pass || process.env.SMTP_PASS,
            smtp_secure: config.smtp_secure || process.env.SMTP_SECURE,
            smtp_from: config.smtp_from || process.env.SMTP_FROM,
        };

        // Ensure we have the minimum required settings
        if (!finalConfig.smtp_host || !finalConfig.smtp_port || !finalConfig.smtp_user || !finalConfig.smtp_pass) {
            console.warn("SMTP settings are incomplete. Email dispatch aborted.");
            return { success: false, error: "Incomplete SMTP configuration." };
        }

        // Initialize Nodemailer transporter with dynamic settings
        const transporter = nodemailer.createTransport({
            host: finalConfig.smtp_host,
            port: Number(finalConfig.smtp_port),
            secure: finalConfig.smtp_secure === "true", // Use true for 465, false for other ports
            auth: {
                user: finalConfig.smtp_user,
                pass: finalConfig.smtp_pass,
            },
        });

        // Send email
        const mailOptions = {
            from: finalConfig.smtp_from || '"Tanzeem-e-Islami" <noreply@tanzeem.org>',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("Error dispatching dynamic email:", error);
        return { success: false, error: error.message };
    }
}
