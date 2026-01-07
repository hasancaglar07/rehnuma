import { CONTACT_EMAIL } from "@/lib/contact";
import { getBaseUrl } from "@/lib/url";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Rehnüma Kadın Dergisi";
const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Adres bilgisi iletişim sayfasında paylaşılır.";
const COMPANY_TAX_OFFICE = process.env.NEXT_PUBLIC_COMPANY_TAX_OFFICE || "";
const COMPANY_TAX_NO = process.env.NEXT_PUBLIC_COMPANY_TAX_NO || "";
const COMPANY_MERSIS = process.env.NEXT_PUBLIC_COMPANY_MERSIS || "";
const COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || "";
const COMPANY_WEBSITE = process.env.NEXT_PUBLIC_COMPANY_WEBSITE || getBaseUrl();

export const COMPANY_INFO = {
  name: COMPANY_NAME,
  address: COMPANY_ADDRESS,
  taxOffice: COMPANY_TAX_OFFICE,
  taxNo: COMPANY_TAX_NO,
  mersis: COMPANY_MERSIS,
  phone: COMPANY_PHONE,
  email: CONTACT_EMAIL,
  website: COMPANY_WEBSITE
};
