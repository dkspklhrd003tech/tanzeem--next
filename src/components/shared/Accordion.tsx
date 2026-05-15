"use client";

import {
  Accordion as ShadinAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AccordionItemData {
  question: string;
  answer: string;
}

interface AccordionProps {
  heading?: string;
  items: AccordionItemData[];
}

export function Accordion({ heading, items }: AccordionProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto max-w-4xl">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            {heading}
          </h2>
        )}
        
        <ShadinAccordion type="single" collapsible className="w-full space-y-4">
          {items.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-xl px-6 bg-card hover:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline py-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground-muted text-base leading-relaxed pb-6">
                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </ShadinAccordion>
      </div>
    </section>
  );
}
