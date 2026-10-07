import Footer from "@frontend/shared/components/Footer";
import Navbar from "@frontend/shared/components/Navbar";
import NotFoundContent from "@frontend/shared/components/NotFoundContent";

export const metadata = { title: "Page introuvable — Umel Couture", robots: { index: false } };

export default function NotFound() {
    return (
        <>
            <Navbar />
            <main id="main-content">
                <NotFoundContent />
            </main>
            <Footer />
        </>
    );
}
