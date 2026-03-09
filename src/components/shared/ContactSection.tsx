"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+92 123 456 789", "+92 987 654 321"],
    action: "tel:+92123456789",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@tanzeem.org", "support@tanzeem.org"],
    action: "mailto:info@tanzeem.org",
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["123 Islamic Center", "Lahore, Pakistan"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 9:00 AM - 1:00 PM"],
  },
];

export function ContactSection() {
  return (
    <section className="section bg-background-secondary">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-foreground-muted text-lg">
            Have questions or want to learn more? We&apos;d love to hear from you.
            Reach out through any of the channels below.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <a
                  href={item.action}
                  className="block bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-sm text-foreground-muted">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Send us a Message
              </h3>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
