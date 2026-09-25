import MobileCarousel from "@frontend/shared/components/MobileCarousel";
import { siteConfig } from "@shared/siteData";
import Link from "next/link";

export default function ServicesCarousel() {
    return (
        <MobileCarousel
            trackClassName="services-editorial"
            itemLabels={siteConfig.services.map(service => service.title)}
            prevLabel="Prestation précédente"
            nextLabel="Prestation suivante"
        >
            {siteConfig.services.map(service => (
                <article className="service-line" key={service.num}>
                    <span className="service-line-number">{service.num}</span>
                    <div className="service-line-heading">
                        <h3>
                            {service.title}
                            {service.badge && <span className="service-badge">{service.badge}</span>}
                        </h3>
                        <p>{service.quote}</p>
                    </div>
                    <p className="service-line-copy">{service.desc}</p>
                    <div className="service-line-meta">
                        <Link href="/contact#reservation" aria-label={`Prendre rendez-vous pour ${service.title}`}>
                            Prendre rendez-vous <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </article>
            ))}
        </MobileCarousel>
    );
}
