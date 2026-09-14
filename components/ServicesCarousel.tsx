import { siteConfig } from "@/lib/siteData";
import Link from "next/link";

export default function ServicesCarousel() {
    return (
        <div className="services-editorial">
            {siteConfig.services.map(service => (
                <article className="service-line" key={service.num}>
                    <span className="service-line-number">{service.num}</span>
                    <div className="service-line-heading">
                        <h3>{service.title}</h3>
                        <p>{service.quote}</p>
                    </div>
                    <p className="service-line-copy">{service.desc}</p>
                    <div className="service-line-meta">
                        <span>{service.price}</span>
                        <Link href="/contact" aria-label={`Prendre rendez-vous pour ${service.title}`}>
                            Découvrir <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
