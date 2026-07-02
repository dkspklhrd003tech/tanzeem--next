export function FaqStyles() {
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
        /* --------------------------------------------
           FAQ ANSWER — scoped for FAQ pages only
           -------------------------------------------- */
        .faq-answer {
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-answer-inner {
            padding: 24px 26px 26px;
        }

        /* ---- regular English paragraphs ---- */
        .faq-answer p {
            margin: 0 0 14px;
            line-height: 1.75;
            font-size: 0.95rem;
            color: #222222;
        }

        .faq-answer p:last-child {
            margin-bottom: 0;
        }

        /* ---- highlighted Urdu paragraph ---- */
        .faq-answer p.urdu,
        .faq-answer-inner p.urdu {
            font-family: "Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Nafees Nastaleeq", serif;
            font-size: 20px;
            text-align: right;
            direction: rtl;
            line-height: 2.2;
            background: #f0faf6;
            border-right: 4px solid #117a5e;
            border-radius: 0 8px 8px 0;
            padding: 12px 18px 12px 12px;
            color: #222222;
            margin: 0 0 16px;
        }

        /* ---- optional: strong / links inside answer ---- */
        .faq-answer strong {
            color: #222222;
            font-weight: 600;
        }

        .faq-answer a {
            color: #0d5844;
            font-weight: 500;
            text-decoration: none;
            border-bottom: 1px solid rgba(13, 88, 68, 0.25);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-answer a:hover {
            color: #117a5e;
            border-bottom-color: #117a5e;
        }

        /* --------------------------------------------
           RESPONSIVE
           -------------------------------------------- */
        @media (max-width: 640px) {
            .faq-answer-inner {
                padding: 18px 18px 22px;
            }

            .faq-answer p.urdu,
            .faq-answer-inner p.urdu {
                font-size: 18px;
                line-height: 2.1;
                padding: 10px 14px 10px 10px;
            }

            .faq-answer p {
                font-size: 0.9rem;
            }
        }
      `
        }} />
    );
}
