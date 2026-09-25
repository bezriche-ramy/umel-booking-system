export interface Review {
    name: string;
    role: string;
    text: string;
}

export const siteConfig = {
    name: "Umel Couture",
    titleDefault: "Robe de mariée sur mesure Seine-et-Marne (77) | Umel Couture",
    descriptionDefault:
        "Créatrice de robes de mariée sur mesure à Servon (77), près de Brie-Comte-Robert, Melun et Créteil. Retouches, location et pressing. Noté 4,9/5 sur Google.",
    url: "https://umelcouture.com",
    phone: "07 49 50 79 57",
    phoneIntl: "+33749507957",
    whatsappUrl: "https://wa.me/33749507957",
    signature: "La robe qui vous ressemble. Vraiment.",
    address: {
        street: "12 rue Georges Truffaut",
        city: "Servon",
        postalCode: "77170",
        region: "Seine-et-Marne",
        country: "FR",
    },
    geo: {
        latitude: 48.7008,
        longitude: 2.5921,
    },
    openingHours: "Tu-Sa 10:00-18:30, Su 11:00-17:00",
    openingHoursSpec: [
        {
            days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:00",
            closes: "18:30",
        },
        { days: ["Sunday"], opens: "11:00", closes: "17:00" },
    ],
    openingHoursText: {
        weekdays: "Mardi au samedi : 10h–18h30",
        sunday: "Dimanche : 11h–17h",
        closed: "Fermé le lundi",
    },
    placeId: "ChIJ3wTGU2ch-kcRP6Cd9pQrkG0",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ3wTGU2ch-kcRP6Cd9pQrkG0",
    areaServed: {
        department: "Seine-et-Marne",
        region: "Île-de-France",
        cities: ["Servon", "Brie-Comte-Robert", "Santeny", "Marolles-en-Brie", "Lésigny", "Melun", "Créteil", "Torcy"],
    },
    rating: {
        value: 4.9,
        count: 336,
    },
    social: {
        instagram: "https://www.instagram.com/umel.couture",
        facebook: "https://www.facebook.com/umel.couture",
        tiktok: "https://www.tiktok.com/@umel.couture",
    },
    founders: [
        {
            name: "Umi",
            role: "Créatrice & Matières",
            description:
                "Elle pense en matières. En tombés. En détails invisibles aux yeux des autres. Elle comprend le vêtement comme un langage silencieux.",
        },
        {
            name: "Melissa",
            role: "Créatrice & Expérience",
            description:
                "Elle pense en expérience. En structure. En relation humaine. Elle apporte l'équilibre, la rigueur, la précision.",
        },
    ],
    navLinks: [
        { href: "/", label: "Accueil" },
        { href: "/notre-histoire", label: "Notre Histoire" },
        { href: "/nos-robes-services", label: "Nos Robes" },
        { href: "/galerie", label: "Galerie" },
        { href: "/contact", label: "Contact" },
    ],
    footerNavLinks: [
        { href: "/contact#reservation", label: "Prendre rendez-vous" },
        { href: "/notre-histoire", label: "Notre Histoire" },
        { href: "/nos-robes-services", label: "Nos Robes & Services" },
        { href: "/comment-ca-marche", label: "Le déroulé d'un rendez-vous" },
        { href: "/galerie", label: "Galerie" },
        { href: "/contact", label: "Contact" },
        { href: "#", label: "Conditions générales" },
    ],
    services: [
        {
            num: "01",
            id: "confection",
            title: "Confection sur mesure",
            quote: '"On ne part jamais d\'une robe. On part de vous."',
            desc: "Une inspiration, une matière, un détail aperçu quelque part. Haut d'un modèle, bas d'un autre, dentelle spécifique — ou une robe créée à partir d'une photo. Plusieurs essayages jusqu'à la perfection.",
            price: "Sur devis — en maison",
            priceFrom: null as number | null,
            url: "/nos-robes-services#confection",
            badge: null as string | null,
            image: {
                src: "/images/shooting/princesse-perles-2.webp",
                alt: "Robe de mariée créée sur mesure par Umel Couture",
            },
        },
        {
            num: "02",
            id: "location",
            title: "Location de robes de mariée",
            quote: "\"L'exigence d'une maison de couture. Une autre manière de vivre sa robe.\"",
            desc: "Les modèles du showroom sont disponibles à la location. Sélectionnés avec le même soin que les créations sur mesure, à essayer directement en boutique.",
            price: "À partir de 1 000€",
            priceFrom: 1000 as number | null,
            url: "/nos-robes-services#location",
            badge: null as string | null,
            image: {
                src: "/images/shooting/princesse-corset-dentelle-3.webp",
                alt: "Robe de mariée du showroom Umel Couture disponible à la location",
            },
        },
        {
            num: "03",
            id: "location-soiree",
            title: "Location de robes de soirée",
            quote: '"Pour tous les moments qui comptent, pas seulement le oui."',
            desc: "Une sélection de robes de soirée — perlées, drapées, brodées — disponibles à la location pour vos soirées et événements. Essayage en boutique, sur rendez-vous.",
            price: "Tarifs en boutique",
            priceFrom: null as number | null,
            url: "/nos-robes-services#location-soiree",
            badge: null as string | null,
            image: {
                src: "/images/flux/image00037.webp",
                alt: "Robe de soirée perlée rouge disponible à la location chez Umel Couture",
            },
        },
        {
            num: "04",
            id: "costumes-homme",
            title: "Costumes homme",
            quote: '"Parce que le marié aussi mérite une tenue qui lui ressemble."',
            desc: "Nouveau chez Umel : les costumes homme. Pour que le marié soit accordé à la mariée, avec le même accompagnement et les mêmes conseils en boutique.",
            price: "Tarifs en boutique",
            priceFrom: null as number | null,
            url: "/nos-robes-services#costumes-homme",
            badge: "Nouveau" as string | null,
            image: null as { src: string; alt: string } | null,
        },
        {
            num: "05",
            id: "retouches",
            title: "Retouches",
            quote: '"Votre robe mérite d\'être parfaite. Peu importe son origine."',
            desc: "Umel retouche les robes ne venant pas de la maison. Envoyez une vidéo portée via WhatsApp au 07 49 50 79 57 pour une première estimation. Devis ajusté en cabine.",
            price: "À partir de 250€",
            priceFrom: 250 as number | null,
            url: "/nos-robes-services#retouches",
            badge: null as string | null,
            image: null as { src: string; alt: string } | null,
        },
        {
            num: "06",
            id: "pressing",
            title: "Pressing spécialisé",
            quote: '"Une robe conserve des souvenirs. Pas des traces."',
            desc: "Traitement soigné pour préserver les matières les plus délicates — tissus, dentelles, broderies. Pour le grand jour, et pour les années qui suivent.",
            price: "À partir de 150€",
            priceFrom: 150 as number | null,
            url: "/nos-robes-services#pressing",
            badge: null as string | null,
            image: null as { src: string; alt: string } | null,
        },
    ],
    /** Grille tarifaire du pressing affichée sur /nos-robes-services#pressing. */
    // TODO: compléter avec la grille tarifaire réelle transmise par l'atelier
    pressingRates: [{ label: "Robe de mariée", price: "À partir de 150 €" }],
};

export const reviewsList: Review[] = [
    {
        name: "Sandrine Tanet",
        role: "il y a 8 mois",
        text: "Un immense merci aux vendeuses pour leur professionnalisme, leur patience et leurs précieux conseils lors de mes essayages. Ce n'était pas gagné au départ, car après trois essayages j'étais très hésitante, mais grâce à leur écoute et leur accompagnement bienveillant, j'ai trouvé LA robe et j'ai même réservé dès le premier essayage ! Trop contente de cette expérience inoubliable.",
    },
    {
        name: "Myriam Mehrie",
        role: "il y a 8 mois",
        text: "Les filles un conseil FONCEZ ! Je viens tout juste de trouver ma robe chez UMEL et ça été MA meilleure expérience dans une boutique de robe de mariée ! Les prestations sont de qualité et l'équipe est vraiment attentive au besoin, elles sont de très bon conseils et d'une gentillesse incroyable ! Merci encore pour tout UMEL COUTURE",
    },
    {
        name: "eliza kaya",
        role: "il y a 7 mois",
        text: "J'ai eu un immense plaisir à faire mes essayages chez Umel Couture. Merci pour votre accueil chaleureux, votre disponibilité et vos conseils toujours bienveillants. Un remerciement tout particulier à Mélissa pour sa sensibilité et sa vision, qui ont donné vie à une robe à mon image. Une expérience unique que je recommande sans hésiter.",
    },
    {
        name: "Camille Couty",
        role: "il y a 5 mois",
        text: "Quelle erreur d'avoir fait mon premier essayage chez Umel !! Les robes sont tellement incroyables tout comme l'accueil qu'il y est difficile d'apprécier d'autres essayages par la suite. Elles valent leurs prix quand on voit la qualité des tissus et le travail dessus. Si vous avez un bon budget allez y les yeux fermés. Ne changez rien !",
    },
    {
        name: "DE SA VIEIRA Andréa",
        role: "il y a 7 mois",
        text: "Une expérience incroyable chez Umel Couture. Je souhaite souligner le professionnalisme, la gentillesse de Mélissa et Lina. J'étais dans l'hésitation entre une robe sirène et une princesse et la solution de Mélissa — un mixte des 2 — a visé juste. J'ai trouvé la robe de ma vie grâce à leurs conseils.",
    },
    {
        name: "Rebecca Paisley",
        role: "il y a 8 mois",
        text: "Je suis venue pour un premier essayage de robe de mariée et ce fut une superbe expérience. Les vendeuses sont agréables, gentilles et ont vraiment pris le temps de me conseiller et me guider. Elles ont créé une superbe ambiance (avec de la musique et on a même dansé). Je recommande à 200 %. Les robes sont juste splendides ! Un rêve devenu réalité. Merci encore.",
    },
    {
        name: "Jade Ludmila Marie-Joseph",
        role: "il y a 8 mois",
        text: "Meilleure expérience d'essayage de robe. La recherche d'une robe de mariée est très stressante mais j'ai eu une expérience unique et agréable chez UMEL. Une mention particulière à ma conseillère Lynda, qui m'a mise à l'aise dès le départ. Elle connaît très bien son métier, à l'écoute, douce et agréable. Je recommande vraiment cette adresse.",
    },
    {
        name: "Kenza Braham",
        role: "il y a 3 mois",
        text: "Ma robe de mariée sur mesure est en cours de création et j'ai adoré l'accueil. L'équipe est adorable, à l'écoute et très professionnelle. On se sent tout de suite à l'aise et en confiance. Je recommande à 100 %.",
    },
    {
        name: "gwladys guionfirmin",
        role: "il y a 8 mois",
        text: "Super accueil ! Une expérience inoubliable ! Merci pour ce merveilleux moment. Merci pour votre professionnalisme, vos conseils avisés, votre gentillesse et votre bienveillance. Vos créations sont MAGNIFIQUES ! Je recommanderai sans hésiter votre adresse à toutes les futures mariées qui recherchent une robe exceptionnelle. À très vite.",
    },
    {
        name: "Inès",
        role: "il y a 3 mois",
        text: "Accueil chaleureux et vendeuse très agréable. J'ai pu trouver la robe de mes rêves grâce à leur spécialité principale : la confection de robes sur mesure. Encore un grand merci à toutes !",
    },
    {
        name: "Elisa Folha",
        role: "il y a 6 mois",
        text: "J'ai fait mon essayage de robe de mariée chez Umel Couture et j'ai adoré ! Leurs robes sont justes splendides. Je voulais remercier infiniment notamment Mélissa et Lynda pour leur accueil, leurs conseils et surtout pour leur gentillesse incroyable ! Encore mille merci !!",
    },
    {
        name: "Inès Ngambali",
        role: "il y a 6 mois",
        text: "J'ai fait 4 boutiques de robes et UMEL est la première où je me suis sentie aussi bien ! Une ambiance que vous trouverez nulle part ailleurs et des conseils tout justes exceptionnels. Merci infiniment pour cette expérience que je n'oublierai jamais. Les filles vous êtes des personnes tellement humaines.",
    },
    {
        name: "Amandine E",
        role: "il y a 6 mois",
        text: "La plus belle expérience que j'ai vécue. Lynda nous a accueilli avec le sourire dès notre arrivée, elle m'a mise en confiance et m'a fait passer un merveilleux moment. Résultat j'ai trouvé la robe de mes rêves, faite sur mesure avec chaque détail qui me correspond. Merci à Lynda et toute l'équipe.",
    },
    {
        name: "Jerina Lembe",
        role: "il y a 7 mois",
        text: "C'était mon tout premier essayage de robe de mariée, et ce fut un moment absolument incroyable, rempli d'émotion et de bonheur. Un immense merci à Lynda et à sa collègue pour leur écoute, leur gentillesse et leur attention à chaque instant. Je recommande vivement cette boutique !",
    },
    {
        name: "Jilali Id",
        role: "il y a un an",
        text: "Dès mon arrivée dans la boutique, j'ai été impressionné par l'élégance du lieu, la qualité des créations et surtout l'accueil irréprochable de l'équipe. Chaque robe est une véritable œuvre d'art. L'essayage s'est déroulé dans une ambiance agréable et sans précipitation. UMEL COUTURE est sans aucun doute l'adresse idéale.",
    },
    {
        name: "Célia Da Costa",
        role: "il y a 6 mois",
        text: "J'ai eu une expérience incroyable chez Umel Couture. Un immense merci à Lynda, qui m'a accompagnée à chacun de mes rendez-vous avec tellement de douceur, de patience et d'écoute. J'ai récupéré ma robe en un mois, avec toutes les modifications réalisées à la perfection. Le résultat est juste sublime ! Je recommande à 100 %.",
    },
    {
        name: "Selma Coskun",
        role: "il y a 3 mois",
        text: "Je recommande Umel Couture les yeux fermés ! Dès mon premier rendez-vous, j'ai été accueillie avec énormément de gentillesse et de professionnalisme. Leur professionnalisme et la qualité de leurs conseils ont fait toute la différence : j'ai trouvé ma robe dès le premier rendez-vous. Je recommande à 100 %. J'ai maintenant hâte de découvrir ma robe finale.",
    },
];
