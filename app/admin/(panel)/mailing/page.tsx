import MailingScreen from "@frontend/modules/admin/screens/MailingScreen";
import { getMailingPageData } from "@backend/modules/mailing/mailing.queries";
import { requirePageSession } from "@backend/modules/auth/guards";

export default async function MailingPage() {
    await requirePageSession();
    return <MailingScreen {...await getMailingPageData()} />;
}
