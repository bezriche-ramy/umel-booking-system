import MailingPanel from "@frontend/modules/admin/components/MailingPanel";
import type { getMailingPageData } from "@backend/modules/mailing/mailing.queries";

export default function MailingScreen(data: Awaited<ReturnType<typeof getMailingPageData>>) {
    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Communication clientes</p>
                    <h1>Mailing</h1>
                </div>
            </header>
            <MailingPanel {...data} />
        </>
    );
}
