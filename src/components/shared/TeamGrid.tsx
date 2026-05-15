"use client";

import { motion } from "framer-motion";
import { Facebook, Twitter, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  designation: string;
  bio?: string;
  avatar?: string;
  socials?: {
    facebook?: string;
    twitter?: string;
    email?: string;
  };
}

interface TeamGridProps {
  heading?: string;
  members: TeamMember[];
}

export function TeamGrid({ heading, members }: TeamGridProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            {heading}
          </h2>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative mb-6 rounded-2xl overflow-hidden aspect-[4/5] bg-card border border-border group-hover:border-primary/50 transition-all duration-300">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <span className="text-4xl font-bold text-primary/20">{member.name.charAt(0)}</span>
                  </div>
                )}
                
                {/* Social Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
                  {member.socials?.facebook && (
                    <a href={member.socials.facebook} className="text-white hover:text-primary transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {member.socials?.twitter && (
                    <a href={member.socials.twitter} className="text-white hover:text-primary transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {member.socials?.email && (
                    <a href={`mailto:${member.socials.email}`} className="text-white hover:text-primary transition-colors">
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-primary font-medium text-sm uppercase tracking-wider">
                  {member.designation}
                </p>
                {member.bio && (
                  <p className="mt-4 text-foreground-muted text-sm line-clamp-3">
                    {member.bio}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
