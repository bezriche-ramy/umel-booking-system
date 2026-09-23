import "@frontend/styles/admin.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Administration — Umel Couture",
    robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <div className="adm">{children}</div>;
}
