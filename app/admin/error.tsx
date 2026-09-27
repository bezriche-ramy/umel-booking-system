"use client";

import { useEffect } from "react";

/** Erreur inattendue dans l'espace atelier (ex. base de données momentanément injoignable). */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="adm-main">
            <div className="dash-error" role="alert">
                <h2>L&apos;espace atelier est momentanément indisponible</h2>
                <p>
                    Le serveur n&apos;a pas pu charger cette page, le plus souvent parce que la base de données ne répond pas. Aucune
                    donnée n&apos;est perdue : réessayez dans un instant.
                </p>
                {error.digest && <p className="dash-muted">Référence de l&apos;erreur : {error.digest}</p>}
                <div className="adm-btns">
                    <button type="button" className="adm-btn" onClick={() => retry()}>
                        Réessayer
                    </button>
                </div>
            </div>
        </main>
    );
}
