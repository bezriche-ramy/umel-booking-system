import type { FaqItem } from "@frontend/modules/site/lib/faq";
import { getFaqSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";

interface FaqSectionProps {
    id: string;
    title: React.ReactNode;
    items: FaqItem[];
}

/** FAQ visible + schéma FAQPage identique. `<details>` natif : réponses présentes dans le HTML, sans JavaScript. */
export default function FaqSection({ id, title, items }: FaqSectionProps) {
    return (
        <section className="s faq-section" aria-labelledby={id}>
            <JsonLd data={getFaqSchema(items)} />
            <div className="faq-inner">
                <h2 id={id} className="faq-title">
                    {title}
                </h2>
                <div className="faq-list">
                    {items.map(item => (
                        <details key={item.question} className="faq-item">
                            <summary>
                                <h3>{item.question}</h3>
                            </summary>
                            <p>{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
