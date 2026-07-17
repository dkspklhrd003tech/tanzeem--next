"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FAQEntry = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const DEFAULT_CATEGORIES = ["General", "Membership", "Programs", "Resources"];

export function FAQWithTabs({ items }: { items: FAQEntry[] }) {
  const categories = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...items.map((i) => i.category),
    ]),
  ];

  const [active, setActive] = useState(categories[0]);

  const filtered = items.filter((i) => i.category === active);

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="mb-8">
        {categories.map((cat) => (
          <TabsTrigger key={cat} value={cat}>
            {cat}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((cat) => (
        <TabsContent key={cat} value={cat}>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {items
              .filter((i) => i.category === cat)
              .map((item, idx) => (
                <AccordionItem
                  key={item.id}
                  value={`${cat}-${idx}`}
                  className="border border-border rounded-md px-4 bg-card"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground-muted pb-4 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            {filtered.length === 0 && cat === active && (
              <p className="text-foreground-muted text-sm">No questions in this category yet.</p>
            )}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
