import nodemailer from "nodemailer";
import { db } from "@/lib/db";
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

        // Ensure we have the minimum required settings
        if (!config.smtp_host || !config.smtp_port || !config.smtp_user || !config.smtp_pass) {
            console.warn("SMTP settings are incomplete. Email dispatch aborted.");
            return { success: false, error: "Incomplete SMTP configuration." };
        }

        // Initialize Nodemailer transporter with dynamic settings
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: Number(config.smtp_port),
            secure: config.smtp_secure === "true", // Use true for 465, false for other ports
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass,
            },
        });

        // Send email
        const mailOptions = {
            from: config.smtp_from || '"Tanzeem-e-Islami" <noreply@tanzeem.org>',
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
