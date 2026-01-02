import { COLLAB_EMAIL, CONTACT_EMAIL } from "@/lib/contact";

export const DEFAULT_CORPORATE_CONTENT = {
  landingTitle: "Zarafetin ve bilgeliğin izinde bir yayın.",
  landingDescription:
    "Rehnüma, kadınların duygu, düşünce ve üretim yolculuğunda sakinlik, derinlik ve ilham sunmak için var. Burada misyonumuzu, vizyonumuzu ve ekip bilgilerimizi bulabilirsiniz.",
  cards: {
    hakkimizda:
      "Rehnüma, kadınların ruhsal, entelektüel ve kültürel gelişimini destekleyen bir yaşam dergisi. Modern dünyanın akışına karşı sakinlik ve ilham sunuyor.",
    misyon:
      "Kadınların iç dünyasını zenginleştiren, aileyi güçlendiren, kültür ve sanatla hayatı güzelleştiren içerikler üretmek.",
    vizyon:
      "Zarafeti, bilgeliği ve üretkenliği birleştiren; kadınlara manevi ve kültürel derinlik kazandıran bir yayın olmak.",
    kunye: "Editoryal ekip, iletişim ve yasal bilgilere dair güncel özet. Güncellemeler için yer tutucu içerik."
  },
  hakkimizda: {
    title: "Hakkımızda",
    description: "Kadınların içsel yolculuğuna zarafetle eşlik eden, maneviyat ve kültürü buluşturan dijital dergi deneyimi.",
    paragraphs: [
      "Rehnüma, kadınların ruhsal, entelektüel ve kültürel gelişimini desteklemek amacıyla hazırlanan bir yaşam dergisidir. Modern dünyanın yoğun akışına karşı sakinlik, derinlik ve ilham sunmayı; kadının hem içsel hem de sosyal ihtiyaçlarına incelikle dokunmayı hedefler.",
      "Hayata zarafetle bakan, üretmeyi değerli gören ve kültürel köklerle bağ kuran kadınlar için güvenilir bir rehber olmayı amaçlayan Rehnüma; manevi duyarlılığı, kültürel farkındalığı ve estetik bir yaşam anlayışını bir araya getirir.",
      "Her sayısında dinginlik, farkındalık ve ilham taşıyan içerikler sunan Rehnüma; aileden sanata, kişisel gelişimden kültürel mirasa kadar geniş bir yelpazede kadının hayatına değer katar.",
      "Rehnüma, kadınların dünyasına ışık düşürmeyi; onların duygu, düşünce ve üretim yolculuklarında zarafetle eşlik etmeyi amaçlar. Bu yolculukta her kadın için bir nefes, bir durak, bir ilham kaynağı olmak dileğiyle…"
    ]
  },
  misyon: {
    title: "Misyon",
    description: "Kadınların iç dünyasını zenginleştiren, aileyi güçlendiren, kültür ve sanatla hayatı güzelleştiren içerikler üretmek.",
    body:
      "Rehnüma’nın misyonu; kadınların ruhsal ve zihinsel yolculuklarında güvenilir bir refakatçi olmak, aileyi ve sosyal bağları güçlendirecek ilhamı sunmak ve kültür-sanatla günlük hayatı daha zarif kılmaktır.",
    bullets: [
      "Maneviyatı besleyen, güven veren içerikler üretmek",
      "Kadınların üretkenliğini ve estetik duyarlılığını desteklemek",
      "Aileyi güçlendiren ve toplumsal iyiliği önceleyen öneriler sunmak"
    ]
  },
  vizyon: {
    title: "Vizyon",
    description: "Zarafeti, bilgeliği ve üretkenliği birleştiren; kadınlara manevi ve kültürel derinlik kazandıran bir yayın olmak.",
    body:
      "Rehnüma, her kadının içsel zenginliğini keşfetmesini, kültürel kökleriyle bağ kurmasını ve üretkenliğini zarafetle beslemesini destekleyen bir dergi olarak konumlanır.",
    bullets: [
      "İlham verici, derinlikli ve güvenilir içeriklerle yol arkadaşlığı yapmak",
      "Manevi duyarlılık ile estetik yaşam anlayışını birleştirmek",
      "Dijitalde sakin ve rafine bir okuma deneyimi sağlamak"
    ]
  },
  kunye: {
    title: "Künye",
    description: "Editoryal ekip, iletişim ve yasal bilgilere dair güncel şablon. Bilgiler sağlandıkça güncellenecektir.",
    sections: [
      {
        title: "Editoryal",
        items: [
          { label: "Genel Yayın Yönetmeni", value: "Belirlenecek" },
          { label: "Editör", value: "Belirlenecek" },
          { label: "Tasarım", value: "Belirlenecek" }
        ]
      },
      {
        title: "İletişim",
        items: [
          { label: "E-posta", value: CONTACT_EMAIL },
          { label: "İşbirliği", value: COLLAB_EMAIL }
        ]
      },
      {
        title: "Yasal",
        items: [
          { label: "Yayın Sahibi", value: "Belirlenecek" },
          { label: "Adres", value: "Belirlenecek" },
          { label: "Vergi No", value: "Belirlenecek" }
        ]
      }
    ]
  }
};

export type CorporateContent = typeof DEFAULT_CORPORATE_CONTENT;
type CorporateSection = CorporateContent["kunye"]["sections"][number];
type CorporateItem = CorporateSection["items"][number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ensureString = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback);

const ensureStringArray = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  return fallback.map((item, index) => ensureString(value[index], item));
};

const normalizeSections = (value: unknown, fallback: CorporateSection[]) => {
  if (!Array.isArray(value)) return fallback;
  return fallback.map((section, sectionIndex) => {
    const rawSection = value[sectionIndex];
    const sectionRecord = isRecord(rawSection) ? rawSection : {};
    const itemsRaw = Array.isArray(sectionRecord.items) ? sectionRecord.items : [];
    return {
      title: ensureString(sectionRecord.title, section.title),
      items: section.items.map((item, itemIndex): CorporateItem => {
        const rawItem = itemsRaw[itemIndex];
        const itemRecord = isRecord(rawItem) ? rawItem : {};
        return {
          label: ensureString(itemRecord.label, item.label),
          value: ensureString(itemRecord.value, item.value)
        };
      })
    };
  });
};

export function normalizeCorporateContent(content?: unknown): CorporateContent {
  if (!isRecord(content)) return DEFAULT_CORPORATE_CONTENT;

  const cards = isRecord(content.cards) ? content.cards : {};
  const hakkimizda = isRecord(content.hakkimizda) ? content.hakkimizda : {};
  const misyon = isRecord(content.misyon) ? content.misyon : {};
  const vizyon = isRecord(content.vizyon) ? content.vizyon : {};
  const kunye = isRecord(content.kunye) ? content.kunye : {};

  return {
    landingTitle: ensureString(content.landingTitle, DEFAULT_CORPORATE_CONTENT.landingTitle),
    landingDescription: ensureString(content.landingDescription, DEFAULT_CORPORATE_CONTENT.landingDescription),
    cards: {
      hakkimizda: ensureString(cards.hakkimizda, DEFAULT_CORPORATE_CONTENT.cards.hakkimizda),
      misyon: ensureString(cards.misyon, DEFAULT_CORPORATE_CONTENT.cards.misyon),
      vizyon: ensureString(cards.vizyon, DEFAULT_CORPORATE_CONTENT.cards.vizyon),
      kunye: ensureString(cards.kunye, DEFAULT_CORPORATE_CONTENT.cards.kunye)
    },
    hakkimizda: {
      title: ensureString(hakkimizda.title, DEFAULT_CORPORATE_CONTENT.hakkimizda.title),
      description: ensureString(hakkimizda.description, DEFAULT_CORPORATE_CONTENT.hakkimizda.description),
      paragraphs: ensureStringArray(hakkimizda.paragraphs, DEFAULT_CORPORATE_CONTENT.hakkimizda.paragraphs)
    },
    misyon: {
      title: ensureString(misyon.title, DEFAULT_CORPORATE_CONTENT.misyon.title),
      description: ensureString(misyon.description, DEFAULT_CORPORATE_CONTENT.misyon.description),
      body: ensureString(misyon.body, DEFAULT_CORPORATE_CONTENT.misyon.body),
      bullets: ensureStringArray(misyon.bullets, DEFAULT_CORPORATE_CONTENT.misyon.bullets)
    },
    vizyon: {
      title: ensureString(vizyon.title, DEFAULT_CORPORATE_CONTENT.vizyon.title),
      description: ensureString(vizyon.description, DEFAULT_CORPORATE_CONTENT.vizyon.description),
      body: ensureString(vizyon.body, DEFAULT_CORPORATE_CONTENT.vizyon.body),
      bullets: ensureStringArray(vizyon.bullets, DEFAULT_CORPORATE_CONTENT.vizyon.bullets)
    },
    kunye: {
      title: ensureString(kunye.title, DEFAULT_CORPORATE_CONTENT.kunye.title),
      description: ensureString(kunye.description, DEFAULT_CORPORATE_CONTENT.kunye.description),
      sections: normalizeSections(kunye.sections, DEFAULT_CORPORATE_CONTENT.kunye.sections)
    }
  };
}
