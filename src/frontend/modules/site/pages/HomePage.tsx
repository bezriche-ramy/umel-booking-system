import CTABand from "@frontend/shared/components/CTABand";
import GoogleRating from "@frontend/modules/site/components/GoogleRating";
import HeroVideo from "@frontend/modules/site/components/HeroVideo";
import ServicesCarousel from "@frontend/modules/site/components/ServicesCarousel";
import TestimonialsTrack from "@frontend/modules/site/components/TestimonialsTrack";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    return (
        <>
            <HeroVideo folio="Spot Officiel — Maison Umel">
                <span className="hero-eyebrow">Maison de couture · Servon, France</span>
                <h1 className="hero-title">
                    <span className="line">
                        <span>La robe qui vous</span>
                    </span>
                    <span className="line">
                        <span>
                            <em>ressemble.</em> Vraiment.
                        </span>
                    </span>
                </h1>
                <p className="hero-sub">Créations de mariée sur mesure, façonnées à l&apos;écoute de votre histoire.</p>
                <div className="hero-actions">
                    <Link href="/contact#reservation" className="hero-btn-primary">
                        Prendre rendez-vous <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </HeroVideo>

            <section className="home-manifesto s" aria-labelledby="manifesto-title">
                <div className="home-manifesto-title">
                    <h2 id="manifesto-title">
                        On ne part jamais
                        <br />
                        d&apos;une robe.
                    </h2>
                </div>
                <div className="home-manifesto-copy">
                    <p>On part de vous.</p>
                    <p>
                        De votre allure, de vos gestes, d&apos;un détail aperçu quelque part. Une création Umel ne vous
                        déguise pas&nbsp;: elle révèle ce qui était déjà là.
                    </p>
                    <Link href="/notre-histoire" className="editorial-link">
                        Découvrir la maison <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </section>

            <section className="home-image-story s" aria-labelledby="savoir-faire-title">
                <figure className="home-image-story-main">
                    <Image
                        src="/images/Robes créées sur mesure4.webp"
                        alt="Robe de mariée Umel Couture créée sur mesure"
                        fill
                        sizes="(max-width: 800px) 100vw, 62vw"
                    />
                    <figcaption>Création sur mesure — Umel Couture</figcaption>
                </figure>
                <div className="home-image-story-copy">
                    <h2 id="savoir-faire-title">
                        L&apos;exigence se cache
                        <br />
                        dans <em>l&apos;invisible.</em>
                    </h2>
                    <p>
                        Un tombé repris jusqu&apos;à l&apos;évidence. Une dentelle choisie pour sa lumière. Une ligne
                        corrigée de quelques millimètres. Le sur-mesure se reconnaît à ce que l&apos;on ressent avant
                        même de le voir.
                    </p>
                    <dl className="home-details">
                        <div>
                            <dt>01</dt>
                            <dd>Matières choisies</dd>
                        </div>
                        <div>
                            <dt>02</dt>
                            <dd>Patronage personnel</dd>
                        </div>
                        <div>
                            <dt>03</dt>
                            <dd>Essayages privés</dd>
                        </div>
                    </dl>
                    <Link href="/sur-mesure" className="editorial-link">
                        Notre approche du sur-mesure <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <figure className="home-image-story-detail">
                    <Image
                        src="/images/Robes créées sur mesure6.webp"
                        alt="Détail de dentelle d'une robe Umel Couture"
                        fill
                        sizes="(max-width: 800px) 58vw, 24vw"
                    />
                </figure>
            </section>

            <section className="home-services s" aria-labelledby="services-title">
                <div className="section-editorial-head">
                    <h2 id="services-title">
                        Une même exigence,
                        <br />
                        <em>quatre gestes.</em>
                    </h2>
                    <p>De la création à la conservation, chaque prestation est menée avec le même soin.</p>
                </div>
                <ServicesCarousel />
            </section>

            <section className="home-atelier s" aria-labelledby="atelier-title">
                <div className="home-atelier-copy">
                    <h2 id="atelier-title">
                        Deux sensibilités.
                        <br />
                        <em>Une seule exigence.</em>
                    </h2>
                    <blockquote>
                        “On observe avant de dessiner. On comprend avant de créer.”<cite>Umi &amp; Melissa</cite>
                    </blockquote>
                    <p>
                        Umi pense en matières, en tombés, en détails invisibles. Melissa pense en expérience, en
                        structure, en relation humaine. Ensemble, elles ont imaginé une maison où chaque femme est reçue
                        sans modèle imposé.
                    </p>
                    <Link href="/notre-histoire" className="editorial-link">
                        Lire leur histoire <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <figure className="home-atelier-wide">
                    <Image
                        src="/images/Ambiance atelier1.webp"
                        alt="L'atelier Umel Couture à Servon"
                        fill
                        sizes="(max-width: 800px) 100vw, 58vw"
                    />
                </figure>
                <figure className="home-atelier-small">
                    <Image
                        src="/images/Ambiance atelier2.webp"
                        alt="Essayage privé dans l'atelier Umel Couture"
                        fill
                        sizes="(max-width: 800px) 64vw, 22vw"
                    />
                    <figcaption>Atelier de Servon — sur rendez-vous</figcaption>
                </figure>
            </section>

            <section className="home-creations s" aria-labelledby="creations-title">
                <div className="section-editorial-head light">
                    <h2 id="creations-title">
                        Chaque robe,
                        <br />
                        <em>une présence.</em>
                    </h2>
                    <Link href="/galerie" className="editorial-link">
                        Voir toute la galerie <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <div className="home-creations-grid">
                    <figure className="creation-a">
                        <Image
                            src="/images/Robes créées sur mesure1.webp"
                            alt="Robe sirène en dentelle Umel Couture"
                            fill
                            sizes="(max-width: 700px) 92vw, 34vw"
                        />
                        <figcaption>01 — Dentelle sculptée</figcaption>
                    </figure>
                    <figure className="creation-b">
                        <Image
                            src="/images/Robes créées sur mesure2.webp"
                            alt="Création nuptiale Umel Couture"
                            fill
                            sizes="(max-width: 700px) 78vw, 28vw"
                        />
                        <figcaption>02 — Ligne couture</figcaption>
                    </figure>
                    <figure className="creation-c">
                        <Image
                            src="/images/Robes créées sur mesure3.webp"
                            alt="Robe brodée créée sur mesure"
                            fill
                            sizes="(max-width: 700px) 82vw, 30vw"
                        />
                        <figcaption>03 — Broderie lumière</figcaption>
                    </figure>
                </div>
            </section>

            <section className="home-testimonials s" aria-labelledby="testimonials-title">
                <div className="section-editorial-head">
                    <h2 id="testimonials-title">
                        Elles racontent
                        <br />
                        <em>leur expérience.</em>
                    </h2>
                    <GoogleRating variant="editorial" />
                </div>
                <TestimonialsTrack />
            </section>

            <CTABand
                label="Votre histoire commence ici"
                title={
                    <>
                        Une robe pensée
                        <br />à partir de <em>vous.</em>
                    </>
                }
                subtitle={
                    <>
                        Rencontrez-nous dans notre atelier de Servon.
                        <br />
                        Mardi — dimanche, sur rendez-vous.
                    </>
                }
                cornerStitches={false}
                btnText="Prendre rendez-vous"
            />
        </>
    );
}
