import type {
  Article,
  CategoryOption,
  Comment,
  Issue,
  OfficialResponse,
  Organization,
  PublicOfficial,
  TimelineEvent,
} from "@/lib/types";

export const categories: CategoryOption[] = [
  { id: "kozlekedes", label: "Közlekedés", icon: "🚦" },
  { id: "katyu", label: "Kátyú", icon: "🕳️" },
  { id: "parkolas", label: "Parkolás", icon: "🅿️" },
  { id: "koztisztasag", label: "Köztisztaság", icon: "🧹" },
  { id: "zoldterulet", label: "Zöldterület", icon: "🌳" },
  { id: "vilagitas", label: "Világítás", icon: "💡" },
  { id: "zaj", label: "Zaj", icon: "🔊" },
  { id: "epuletek", label: "Épületek", icon: "🏢" },
  { id: "egyeb", label: "Egyéb", icon: "📌" },
];

export const issues: Issue[] = [
  {
    id: "iss-001",
    slug: "zebra-kell-az-iskola-ele",
    title: "Zebra kell az iskola elé",
    settlement: "Budaörs",
    address: "Szabadság út",
    category: "kozlekedes",
    type: "problema",
    status: "vizsgalat",
    supporters: 824,
    supportersChange24h: 312,
    createdAt: "2026-09-24T08:12:00+02:00",
    summary:
      "A gyalogosok nehezen tudnak biztonságosan átkelni az iskola előtt.",
    problem:
      "A 1. számú általános iskola előtt reggelente és délutánonként több száz gyerek és szülő kel át az úton. Nincs kijelölt gyalogátkelőhely, a forgalom gyors, és több közel-baleset is történt az elmúlt hónapokban. A meglévő zebra több mint 200 méterre van.",
    request:
      "Gyalogátkelőhely kialakítását és 30 km/h-s sebességkorlátozást az iskola előtti szakaszon.",
    location: { lat: 47.4608, lng: 18.9583 },
    images: [
      "https://images.unsplash.com/photo-1544620341-1adc273c8312?w=1200&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    ],
    distanceMeters: 136,
    organizationId: "org-budaors",
    officialIds: ["po-kiss", "po-nagy"],
    articleSlug: "tobb-szazan-kernek-zebrat-az-iskola-ele-budaorson",
  },
  {
    id: "iss-002",
    slug: "katyus-utszakasz-az-m1-felhajtonal",
    title: "Kátyús útszakasz az M1 felhajtónál",
    settlement: "Budapest",
    address: "XI. kerület, Budaörsi út",
    category: "katyu",
    type: "problema",
    status: "folyamatban",
    supporters: 1456,
    supportersChange24h: 89,
    createdAt: "2026-09-10T14:30:00+02:00",
    summary: "Több méteres kátyúk veszélyeztetik a felhajtó forgalmát.",
    problem:
      "Az M1 felhajtó előtt több mély kátyú alakult ki. Eső után víz áll bennük, sötétben nehezen láthatók. Több gumiabroncs-sérülésről is beszámoltak a helyi sofőrök.",
    request: "Az útszakasz mielőbbi javítását és burkolatcsere ütemezését.",
    location: { lat: 47.4682, lng: 19.0251 },
    images: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&q=80",
    ],
    distanceMeters: 2400,
    organizationId: "org-kozut",
    officialIds: ["po-szabo"],
  },
  {
    id: "iss-003",
    slug: "vilagitas-hianyzik-a-jatszoteron",
    title: "Világítás hiányzik a játszótéren",
    settlement: "Érd",
    address: "Park utca 12.",
    category: "vilagitas",
    type: "problema",
    status: "ertesitve",
    supporters: 412,
    supportersChange24h: 54,
    createdAt: "2026-09-18T19:05:00+02:00",
    summary: "Sötétedés után a játszótér használhatatlan a hiányzó lámpák miatt.",
    problem:
      "A parkban három lámpatest évek óta nem működik. Este a szülők nem merik a gyerekeket a játszótérre vinni, a környék pedig balesetveszélyes.",
    request: "A lámpatestek javítását vagy cseréjét 30 napon belül.",
    location: { lat: 47.3912, lng: 18.9135 },
    images: [],
    distanceMeters: 820,
    organizationId: "org-erd",
  },
  {
    id: "iss-004",
    slug: "illegális-hulladeklerako-a-patak-menten",
    title: "Illegális hulladéklerakó a patak mentén",
    settlement: "Törökbálint",
    address: "Patakparti sétány",
    category: "koztisztasag",
    type: "problema",
    status: "vizsgalat",
    supporters: 678,
    supportersChange24h: 121,
    createdAt: "2026-09-20T11:20:00+02:00",
    summary: "Építési törmelék és háztartási hulladék gyűlik a patakparton.",
    problem:
      "Az elmúlt hetekben rendszeresen hordanak építési törmeléket és zsákos hulladékot a patakparti sétány mellé. A bűz erősödik, és félek, hogy a következő esőnél a patakba kerül.",
    request: "Hulladékelszállítást, kamerás megfigyelést és rendszeres ellenőrzést.",
    location: { lat: 47.4331, lng: 18.9142 },
    images: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b4da?w=1200&q=80",
    ],
    distanceMeters: 3100,
    organizationId: "org-torokbalint",
  },
  {
    id: "iss-005",
    slug: "uj-padok-a-vasutallomasnal",
    title: "Új padok a vasútállomásnál",
    settlement: "Budaörs",
    address: "Vasút utca",
    category: "egyeb",
    type: "javaslat",
    status: "uj",
    supporters: 298,
    supportersChange24h: 76,
    createdAt: "2026-09-22T07:45:00+02:00",
    summary: "Az időseknek és ingázóknak nincs hol várakozniuk fedetten.",
    problem:
      "A vasútállomás peronján csak két pad van, és azok is rossz állapotban. Esőben és kánikulában különösen nehéz a várakozás az idősebbeknek.",
    request: "Legalább négy új, fedett váróhellyel ellátott pad telepítését.",
    location: { lat: 47.4589, lng: 18.9512 },
    images: [],
    distanceMeters: 450,
  },
  {
    id: "iss-006",
    slug: "fák-pótlása-a-főtéren",
    title: "Fák pótlása a főtéren",
    settlement: "Budakeszi",
    address: "Fő tér",
    category: "zoldterulet",
    type: "javaslat",
    status: "folyamatban",
    supporters: 931,
    supportersChange24h: 44,
    createdAt: "2026-08-28T16:00:00+02:00",
    summary: "A kivágott fák helyére új ültetést kérnek a lakók.",
    problem:
      "Tavasszal öt idős fát vágtak ki a főtéren. Az árnyék eltűnt, a tér nyáron tűző napos lett. Az ígért pótlás még nem történt meg.",
    request: "Legalább öt őshonos fa ültetését az őszi ültetési időszakban.",
    location: { lat: 47.5142, lng: 18.9281 },
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
    ],
    distanceMeters: 5600,
    organizationId: "org-budakeszi",
  },
  {
    id: "iss-007",
    slug: "uj-zebra-keszult-az-iskola-ele",
    title: "Új zebra készült az iskola elé",
    settlement: "Solymár",
    address: "Iskola utca",
    category: "kozlekedes",
    type: "problema",
    status: "megoldott",
    supporters: 1842,
    createdAt: "2026-08-01T09:00:00+02:00",
    summary: "A közösségi bejelentés után 23 nap alatt megépült a gyalogátkelőhely.",
    problem:
      "Az iskola előtt nem volt biztonságos átkelési lehetőség. A szülők hónapok óta kérték a zebrát.",
    request: "Gyalogátkelőhely kialakítását az iskola főbejárata előtt.",
    location: { lat: 47.5921, lng: 18.9284 },
    images: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
    ],
    organizationId: "org-solymar",
  },
  {
    id: "iss-008",
    slug: "megjavitottak-a-jatszoteri-lampakat",
    title: "Megjavították a játszótéri lámpákat",
    settlement: "Budapest",
    address: "II. kerület, Fillér utca",
    category: "vilagitas",
    type: "problema",
    status: "megoldott",
    supporters: 623,
    createdAt: "2026-07-15T10:00:00+02:00",
    summary: "Három hónap után újra világít a játszótér.",
    problem: "Több lámpa nem működött a játszótéren este.",
    request: "A világítás helyreállítását.",
    location: { lat: 47.5152, lng: 19.0123 },
    images: [],
  },
  {
    id: "iss-009",
    slug: "parkolohelyek-az-orvosi-rendelo-elott",
    title: "Parkolóhelyek az orvosi rendelő előtt",
    settlement: "Budaörs",
    address: "Egészségház utca",
    category: "parkolas",
    type: "javaslat",
    status: "vizsgalat",
    supporters: 367,
    supportersChange24h: 28,
    createdAt: "2026-09-15T12:00:00+02:00",
    summary: "Mozgáskorlátozott várakozási helyek hiányoznak a rendelő előtt.",
    problem:
      "Az orvosi rendelő előtt nincs kijelölt mozgáskorlátozott parkoló. Az időseknek gyakran messzebbről kell gyalogolniuk.",
    request: "Legalább két kijelölt akadálymentes parkolóhelyet.",
    location: { lat: 47.4621, lng: 18.9601 },
    images: [],
    distanceMeters: 210,
  },
];

export const organizations: Organization[] = [
  {
    id: "org-budaors",
    slug: "budaors-varos-onkormanyzata",
    name: "Budaörs Város Önkormányzata",
    orgType: "onkormanyzat",
    settlement: "Budaörs",
    website: "https://budaors.hu",
    contactEmail: "ugyfelszolgalat@budaors.hu",
    notifiedAt: "2026-09-25T09:00:00+02:00",
    respondedAt: "2026-09-27T14:30:00+02:00",
    avgResponseDays: 2.4,
  },
  {
    id: "org-kozut",
    slug: "magyar-kozut",
    name: "Magyar Közút Nonprofit Zrt.",
    orgType: "kozut",
    website: "https://www.kozut.hu",
    notifiedAt: "2026-09-12T10:00:00+02:00",
    respondedAt: "2026-09-21T11:15:00+02:00",
    avgResponseDays: 5.1,
  },
  {
    id: "org-erd",
    slug: "erd-varos-onkormanyzata",
    name: "Érd Megyei Jogú Város Önkormányzata",
    orgType: "onkormanyzat",
    settlement: "Érd",
    notifiedAt: "2026-09-19T08:30:00+02:00",
  },
  {
    id: "org-torokbalint",
    slug: "torokbalint-varos-onkormanyzata",
    name: "Törökbálint Város Önkormányzata",
    orgType: "onkormanyzat",
    settlement: "Törökbálint",
    notifiedAt: "2026-09-21T09:00:00+02:00",
  },
  {
    id: "org-budakeszi",
    slug: "budakeszi-varos-onkormanyzata",
    name: "Budakeszi Város Önkormányzata",
    orgType: "onkormanyzat",
    settlement: "Budakeszi",
    notifiedAt: "2026-09-01T10:00:00+02:00",
    respondedAt: "2026-09-08T16:00:00+02:00",
  },
  {
    id: "org-solymar",
    slug: "solymar-nagykozseg-onkormanyzata",
    name: "Solymár Nagyközség Önkormányzata",
    orgType: "onkormanyzat",
    settlement: "Solymár",
    notifiedAt: "2026-08-02T09:00:00+02:00",
    respondedAt: "2026-08-10T12:00:00+02:00",
  },
  {
    id: "org-fovaros",
    slug: "budapest-fovaros-onkormanyzata",
    name: "Budapest Főváros Önkormányzata",
    orgType: "fovaros",
    settlement: "Budapest",
    website: "https://budapest.hu",
  },
  {
    id: "org-kormanyhivatal-pest",
    slug: "pest-varmegyei-kormanyhivatal",
    name: "Pest Vármegyei Kormányhivatal",
    orgType: "kormanyhivatal",
    website: "https://kormanyhivatalok.hu",
  },
  {
    id: "org-mvm",
    slug: "mvm-next",
    name: "MVM Next Energiakereskedelmi Zrt.",
    orgType: "kozmu",
    website: "https://www.mvm.hu",
  },
  {
    id: "org-elmu",
    slug: "elmu-halozati",
    name: "ELMŰ Hálózati Kft.",
    orgType: "kozmu",
    website: "https://www.elmu.hu",
  },
  {
    id: "org-eon",
    slug: "eon-hungaria",
    name: "E.ON Hungária Zrt.",
    orgType: "kozmu",
    website: "https://www.eon.hu",
  },
  {
    id: "org-foviz",
    slug: "foviz",
    name: "Fővárosi Vízművek Zrt.",
    orgType: "kozmu",
    settlement: "Budapest",
    website: "https://www.vizmuvek.hu",
  },
];

/** Default mock links for demo issues (when DB unavailable). */
export const mockIssueOrgLinks: Record<
  string,
  { organizationId: string; role: import("@/lib/types").OrgRelationRole; linkStatus: import("@/lib/types").OrgLinkStatus }[]
> = {
  "zebra-kell-az-iskola-ele": [
    { organizationId: "org-budaors", role: "illetekes", linkStatus: "valaszolt" },
  ],
  "katyus-utszakasz-az-m1-felhajtonal": [
    { organizationId: "org-kozut", role: "illetekes", linkStatus: "folyamatban" },
    { organizationId: "org-fovaros", role: "megfigyelo", linkStatus: "hozzarendelve" },
  ],
  "vilagitas-hianyzik-a-jatszoteron": [
    { organizationId: "org-erd", role: "illetekes", linkStatus: "ertesitve" },
    { organizationId: "org-elmu", role: "kozmu", linkStatus: "hozzarendelve" },
  ],
};

export const officials: PublicOfficial[] = [
  {
    id: "po-kiss",
    slug: "kiss-andras",
    name: "Kiss András",
    title: "alpolgármester",
    area: "Budaörs",
    verified: true,
    claimed: true,
    relation: "valaszolt",
    facebookUrl: "https://facebook.com",
  },
  {
    id: "po-nagy",
    slug: "nagy-eszter",
    name: "Nagy Eszter",
    title: "önkormányzati képviselő",
    area: "Budaörs, 3. választókerület",
    verified: false,
    claimed: false,
    relation: "megszolitva",
  },
  {
    id: "po-szabo",
    slug: "szabo-peter",
    name: "Szabó Péter",
    title: "üzemeltetési vezető",
    area: "Magyar Közút – Pest megye",
    verified: true,
    claimed: true,
    relation: "foglalkozik",
  },
];

export const timelines: Record<string, TimelineEvent[]> = {
  "zebra-kell-az-iskola-ele": [
    {
      id: "t1",
      date: "2026-09-24",
      title: "Ügy létrejött",
      icon: "created",
    },
    {
      id: "t2",
      date: "2026-09-25",
      title: "KÖZÜGY értesítette Budaörs Város Önkormányzatát",
      icon: "email",
    },
    {
      id: "t3",
      date: "2026-09-27",
      title: "Hivatalos válasz érkezett",
      icon: "response",
    },
    {
      id: "t4",
      date: "2026-09-28",
      title: "Vizsgálat alatt",
      description: "Az önkormányzat helyszíni bejárást ütemezett.",
      icon: "status",
    },
  ],
  "katyus-utszakasz-az-m1-felhajtonal": [
    {
      id: "t1",
      date: "2026-09-10",
      title: "Ügy létrejött",
      icon: "created",
    },
    {
      id: "t2",
      date: "2026-09-12",
      title: "KÖZÜGY értesítette a Magyar Közutat",
      icon: "email",
    },
    {
      id: "t3",
      date: "2026-09-21",
      title: "Hivatalos válasz érkezett",
      icon: "response",
    },
  ],
};

export const officialResponses: Record<string, OfficialResponse> = {
  "zebra-kell-az-iskola-ele": {
    id: "resp-001",
    organizationName: "Budaörs Város Önkormányzata",
    date: "2026-09-27T14:30:00+02:00",
    summary:
      "Az önkormányzat helyszíni vizsgálatot kezdeményezett, és október 15-ig dönt a további lépésekről.",
    originalText:
      "Tisztelt Érintettek!\n\nKöszönjük a bejelentést. A Városüzemeltetési Iroda helyszíni vizsgálatot indított az iskola előtti szakaszon. A forgalomszámlálás és a biztonsági értékelés eredménye alapján október 15-ig döntünk a gyalogátkelőhely és a sebességkorlátozás ügyében.\n\nÜdvözlettel,\nBudaörs Város Önkormányzata",
    verified: true,
  },
  "katyus-utszakasz-az-m1-felhajtonal": {
    id: "resp-002",
    organizationName: "Magyar Közút Nonprofit Zrt.",
    date: "2026-09-21T11:15:00+02:00",
    summary: "A javítást október első felére ütemezték.",
    originalText:
      "A bejelentett útszakasz javítását az októberi ütemtervbe emeltük. A kátyúzási munkák várhatóan október 5–12. között zajlanak, időjárásfüggően.",
    verified: true,
  },
};

export const articles: Article[] = [
  {
    id: "art-001",
    slug: "tobb-szazan-kernek-zebrat-az-iskola-ele-budaorson",
    title: "Több százan kérnek zebrát az iskola elé Budaörsön",
    lead: "A budaörsi 1. számú általános iskola előtt egyre többen jelzik: nincs biztonságos átkelési lehetőség a gyerekeknek.",
    category: "Közlekedés",
    date: "2026-09-28T10:00:00+02:00",
    author: "KÖZÜGY szerkesztőség",
    imageUrl:
      "https://images.unsplash.com/photo-1544620341-1adc273c8312?w=1400&q=80",
    relatedIssueSlug: "zebra-kell-az-iskola-ele",
    relatedSupporters: 824,
    relatedIssueCount: 1,
    body: {
      happened:
        "Szeptember végén több mint nyolcszáz érintett jelezte a KÖZÜGY-ön, hogy az iskola előtt hiányzik a gyalogátkelőhely. A szülők közel-balesetekről számoltak be.",
      request:
        "A közösség gyalogátkelőhelyet és 30 km/h-s sebességkorlátozást kér az iskola előtti szakaszon.",
      response:
        "Budaörs Város Önkormányzata helyszíni vizsgálatot indított, és október 15-ig ígér döntést.",
      timeline:
        "Az ügy szeptember 24-én indult, másnap értesítettük az önkormányzatot, 27-én pedig hivatalos válasz érkezett.",
      next: "A helyszíni bejárás után derül ki, mikor kezdődhet a tervezés és a kivitelezés.",
    },
  },
  {
    id: "art-002",
    slug: "hogyan-javitotta-meg-a-kozut-a-katyus-felhajtot",
    title: "Hogyan válaszolt a Közút a kátyús felhajtóra?",
    lead: "Másfél ezer érintett után a Magyar Közút októberi javítást ígért az M1 felhajtó előtt.",
    category: "Infrastruktúra",
    date: "2026-09-22T09:00:00+02:00",
    author: "KÖZÜGY szerkesztőség",
    imageUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&q=80",
    relatedIssueSlug: "katyus-utszakasz-az-m1-felhajtonal",
    relatedSupporters: 1456,
    relatedIssueCount: 1,
    body: {
      happened: "A felhajtó előtti kátyúk miatt több gumiabroncs-sérülés történt.",
      request: "Az érintettek mielőbbi burkolatjavítást kértek.",
      response: "A Magyar Közút október első felére ütemezte a javítást.",
      timeline: "Bejelentés, értesítés, majd kilenc nap múlva hivatalos válasz.",
      next: "A munkálatok után frissítjük az ügy státuszát.",
    },
  },
  {
    id: "art-003",
    slug: "23-nap-alatt-keszult-el-a-zebra-solymaron",
    title: "23 nap alatt készült el a zebra Solymáron",
    lead: "Pozitív példa: a közösségi bejelentés után három hét alatt megépült a gyalogátkelőhely.",
    category: "Megoldódott",
    date: "2026-08-24T11:00:00+02:00",
    author: "KÖZÜGY szerkesztőség",
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
    relatedIssueSlug: "uj-zebra-keszult-az-iskola-ele",
    relatedSupporters: 1842,
    relatedIssueCount: 1,
    body: {
      happened: "Solymáron az iskola előtt hiányzott a zebra.",
      request: "Gyalogátkelőhely az iskola főbejárata előtt.",
      response: "Az önkormányzat gyorsan reagált és ütemezte a kivitelezést.",
      timeline: "Bejelentéstől a kész zebraig 23 nap telt el.",
      next: "Hasonló ügyekben a követhető folyamat a legfontosabb tanulság.",
    },
  },
  {
    id: "art-004",
    slug: "miert-fontos-a-nyilvanos-valasz",
    title: "Miért fontos a nyilvános válasz?",
    lead: "A KÖZÜGY nem csak bejelentőfelület: a hivatalos válaszok mindenki számára olvashatók.",
    category: "Háttér",
    date: "2026-09-12T08:00:00+02:00",
    author: "KÖZÜGY szerkesztőség",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    relatedIssueCount: 12,
    body: {
      happened:
        "Egyre több szervezet válaszol nyilvánosan a közösségi ügyekre.",
      request: "Az érintettek érthető, követhető tájékoztatást szeretnének.",
      response:
        "A válaszokat AI összefoglalóval és eredeti szöveggel is közzétesszük.",
      timeline: "A modell több településen is működik már.",
      next: "Folytatjuk a szervezetek és döntéshozók átlátható kapcsolását.",
    },
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    author: "Kovács Anna",
    date: "2026-09-25T18:22:00+02:00",
    text: "Minden nap itt kelünk át a gyerekkel. Teljesen egyetértek, nagyon kell a zebra.",
  },
  {
    id: "c2",
    author: "Tóth Gábor",
    date: "2026-09-26T08:05:00+02:00",
    text: "Reggelente káosz van. A 30-as tábla is sokat segítene.",
  },
  {
    id: "c3",
    author: "Varga Judit",
    date: "2026-09-27T20:41:00+02:00",
    text: "Örülök, hogy az önkormányzat válaszolt. Remélem, gyorsan lesz belőle döntés.",
  },
];

export function getIssueBySlug(slug: string) {
  return issues.find((i) => i.slug === slug);
}

export function getArticleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function getOrganization(id?: string) {
  return organizations.find((o) => o.id === id);
}

export function getOfficialsForIssue(ids?: string[]) {
  if (!ids?.length) return [];
  return officials.filter((o) => ids.includes(o.id));
}

export function getTrendingIssues() {
  return issues
    .filter((i) => i.status !== "megoldott")
    .sort((a, b) => (b.supportersChange24h ?? 0) - (a.supportersChange24h ?? 0))
    .slice(0, 6);
}

export function getResolvedIssues() {
  return issues.filter((i) => i.status === "megoldott").slice(0, 4);
}

export function getNearbyIssues() {
  return issues
    .filter((i) => i.distanceMeters != null && i.status !== "megoldott")
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
    .slice(0, 6);
}

export function getRecentResponses() {
  return Object.entries(officialResponses).map(([slug, response]) => ({
    slug,
    response,
    issue: getIssueBySlug(slug)!,
  }));
}

export function getRelatedIssues(slug: string, limit = 4) {
  const current = getIssueBySlug(slug);
  if (!current) return [];
  return issues
    .filter((i) => i.slug !== slug && i.status !== "megoldott")
    .slice(0, limit)
    .map((i, idx) => ({
      ...i,
      distanceMeters: 120 + idx * 340,
    }));
}

export const adminKpis = {
  newIssuesToday: 14,
  pendingModeration: 7,
  unanswered: 23,
  officialResponsesToday: 5,
  articleDrafts: 3,
  resolved: 41,
};
