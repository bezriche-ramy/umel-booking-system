import Footer from "@frontend/shared/components/Footer";
import Navbar from "@frontend/shared/components/Navbar";
import ScrollReveal from "@frontend/shared/components/ScrollReveal";
import WhatsAppButton from "@frontend/shared/components/WhatsAppButton";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <a className="skip-link" href="#main-content">
                Aller au contenu
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1}>
                {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <ScrollReveal />
        </>
    );
}
