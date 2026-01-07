import crypto from "crypto";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { load } from "cheerio";

const KUVEYTPOS_ENDPOINTS = {
  production: {
    paymentApi: "https://sanalpos.kuveytturk.com.tr/ServiceGateWay/Home",
    gateway3d: "https://sanalpos.kuveytturk.com.tr/ServiceGateWay/Home/ThreeDModelPayGate",
    queryApi: "https://boa.kuveytturk.com.tr/BOA.Integration.WCFService/BOA.Integration.VirtualPos/VirtualPosService.svc/Basic"
  },
  test: {
    paymentApi: "https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home",
    gateway3d: "https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home/ThreeDModelPayGate",
    queryApi: "https://boatest.kuveytturk.com.tr/BOA.Integration.WCFService/BOA.Integration.VirtualPos/VirtualPosService.svc/Basic"
  }
} as const;

const CURRENCY_CODES: Record<string, string> = {
  TRY: "0949",
  USD: "0840",
  EUR: "0978"
};

const SOAP_NAMESPACE = "http://boa.net/BOA.Integration.VirtualPos/Service";
const SOAP_ACTION_BASE = "http://boa.net/BOA.Integration.VirtualPos/Service/IVirtualPosService";

const builder = new XMLBuilder({
  ignoreAttributes: false,
  suppressEmptyNode: true
});
const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true
});
const soapParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
  removeNSPrefix: true
});

type KuveytAccount = {
  merchantId: string;
  customerId: string;
  userName: string;
  storeKey: string;
};

type KuveytEndpoints = {
  paymentApi: string;
  gateway3d: string;
  queryApi: string;
};

export type KuveytCard = {
  holderName: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  type?: "Visa" | "MasterCard" | "Troy" | "";
};

export type KuveytBilling = {
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode?: string;
};

export type KuveytOrder = {
  id: string;
  amountCents: number;
  currency: string;
  installment?: number;
  ip: string;
  successUrl: string;
  failUrl: string;
};

export type KuveytStatusQuery = {
  id: string;
  remoteOrderId?: string | null;
  currency: string;
  startDate?: Date;
  endDate?: Date;
};

export type KuveytCancelOrder = {
  id: string;
  remoteOrderId: string;
  refRetNum: string;
  transactionId: string;
  authCode: string;
  amountCents: number;
  currency: string;
};

export type KuveytRefundOrder = {
  id: string;
  remoteOrderId: string;
  refRetNum: string;
  transactionId: string;
  authCode: string;
  amountCents: number;
  currency: string;
  isPartial?: boolean;
};

export function getKuveytPosConfig(): { account: KuveytAccount; endpoints: KuveytEndpoints; testMode: boolean } {
  const merchantId = process.env.KUVEYTPOS_MERCHANT_ID;
  const customerId = process.env.KUVEYTPOS_TERMINAL_ID;
  const userName = process.env.KUVEYTPOS_USER_NAME;
  const storeKey = process.env.KUVEYTPOS_ENC_KEY;
  if (!merchantId || !customerId || !userName || !storeKey) {
    throw new Error("KUVEYTPOS ayarlari eksik");
  }
  const testMode = process.env.KUVEYTPOS_TEST_MODE === "true";
  return {
    account: { merchantId, customerId, userName, storeKey },
    endpoints: testMode ? KUVEYTPOS_ENDPOINTS.test : KUVEYTPOS_ENDPOINTS.production,
    testMode
  };
}

export function buildEnrollmentRequestData(order: KuveytOrder, account: KuveytAccount, card: KuveytCard, billing: KuveytBilling) {
  const amount = String(Math.round(order.amountCents));
  const installmentCount = normalizeInstallment(order.installment ?? 0);
  const expMonth = normalizeExpiry(card.expMonth, 2);
  const expYear = normalizeExpiry(card.expYear, 2);
  const cardType = card.type ?? detectCardType(card.number);
  const countryCode = billing.countryCode || "792";

  const requestData: Record<string, any> = {
    MerchantId: account.merchantId,
    CustomerId: account.customerId,
    UserName: account.userName,
    APIVersion: "TDV2.0.0",
    TransactionType: "Sale",
    TransactionSecurity: "3",
    InstallmentCount: installmentCount,
    Amount: amount,
    DisplayAmount: amount,
    CurrencyCode: CURRENCY_CODES[order.currency] ?? order.currency,
    MerchantOrderId: order.id,
    OkUrl: order.successUrl,
    FailUrl: order.failUrl,
    DeviceData: {
      ClientIP: order.ip,
      DeviceChannel: "02"
    },
    CardHolderData: {
      BillAddrCity: billing.city,
      BillAddrCountry: countryCode,
      BillAddrLine1: billing.addressLine,
      BillAddrPostCode: billing.postalCode,
      BillAddrState: billing.state,
      Email: billing.email,
      MobilePhone: {
        Cc: "90",
        Subscriber: normalizePhone(billing.phone)
      }
    },
    CardHolderName: card.holderName,
    CardType: cardType || "",
    CardNumber: normalizeCardNumber(card.number),
    CardExpireDateYear: expYear,
    CardExpireDateMonth: expMonth,
    CardCVV2: card.cvv
  };

  requestData.HashData = createHash(account, requestData);
  return requestData;
}

export function build3DPaymentRequestData(order: KuveytOrder, account: KuveytAccount, authResponse: any) {
  const message = authResponse.VPosMessage ?? {};
  const requestData: Record<string, any> = {
    MerchantId: account.merchantId,
    CustomerId: account.customerId,
    UserName: account.userName,
    APIVersion: "TDV2.0.0",
    HashData: "",
    CustomerIPAddress: order.ip,
    KuveytTurkVPosAdditionalData: {
      AdditionalData: {
        Key: "MD",
        Data: authResponse.MD
      }
    },
    TransactionType: "Sale",
    InstallmentCount: message.InstallmentCount,
    Amount: message.Amount,
    DisplayAmount: message.Amount,
    CurrencyCode: message.CurrencyCode,
    MerchantOrderId: message.MerchantOrderId,
    TransactionSecurity: message.TransactionSecurity
  };

  requestData.HashData = createHash(account, requestData);
  return requestData;
}

export function encodeKuveytXml(payload: Record<string, any>) {
  const xmlBody = builder.build({ KuveytTurkVPosMessage: payload });
  return `<?xml version="1.0" encoding="ISO-8859-1"?>${xmlBody}`;
}

export function parseKuveytXml(xml: string) {
  const parsed = parser.parse(xml);
  return parsed?.KuveytTurkVPosMessage ?? parsed;
}

export async function sendKuveytSoapRequest(
  action: "SaleReversal" | "DrawBack" | "PartialDrawback" | "GetMerchantOrderDetail",
  requestData: Record<string, any>,
  endpoints: KuveytEndpoints
) {
  const xml = buildSoapEnvelope(action, requestData);
  const response = await fetch(endpoints.queryApi, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${SOAP_ACTION_BASE}/${action}`
    },
    body: xml
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Kuveyt SOAP hata: ${response.status}`);
  }
  return parseKuveytSoapResponse(text, action);
}

export function parse3DFormResponse(html: string) {
  const $ = load(html);
  const form = $("form").first();
  const action = form.attr("action") || "";
  const inputs: Record<string, string> = {};
  form.find("input").each((_, el) => {
    const name = $(el).attr("name");
    if (!name || name === "submit" || name === "submitBtn") return;
    const value = $(el).attr("value");
    if (value === undefined) return;
    inputs[name] = value;
  });
  return { gateway: action, inputs };
}

export function mapAuthResponse(raw: any) {
  const responseCode = raw?.ResponseCode ?? null;
  const responseMessage = raw?.ResponseMessage ?? null;
  const message = raw?.VPosMessage ?? {};
  return {
    responseCode,
    responseMessage,
    orderId: message.MerchantOrderId ?? raw?.MerchantOrderId ?? null,
    amount: message.Amount ?? null,
    currency: message.CurrencyCode ?? null,
    cardMasked: message.CardNumber ?? null,
    transactionSecurity: message.TransactionSecurity ?? null
  };
}

export function mapPaymentResponse(raw: any) {
  const responseCode = raw?.ResponseCode ?? null;
  const responseMessage = raw?.ResponseMessage ?? null;
  const message = raw?.VPosMessage ?? {};
  return {
    responseCode,
    responseMessage,
    orderId: raw?.MerchantOrderId ?? null,
    remoteOrderId: raw?.OrderId ?? null,
    authCode: raw?.ProvisionNumber ?? null,
    refRetNum: raw?.RRN ?? null,
    transactionId: raw?.Stan ?? null,
    batchNum: message?.BatchID ?? null,
    amount: message?.Amount ?? null,
    currency: message?.CurrencyCode ?? null,
    installmentCount: normalizeInstallment(message?.InstallmentCount ?? "0"),
    cardMasked: message?.CardNumber ?? null
  };
}

export function get3DProvisionUrl(endpoints: KuveytEndpoints) {
  return `${endpoints.paymentApi}/ThreeDModelProvisionGate`;
}

export function buildStatusRequestData(query: KuveytStatusQuery, account: KuveytAccount) {
  const startDate = query.startDate ?? new Date(Date.now() - 360 * 24 * 60 * 60 * 1000);
  const endDate = query.endDate ?? new Date();
  const vPosMessage: Record<string, any> = {
    MerchantId: account.merchantId,
    CustomerId: account.customerId,
    UserName: account.userName,
    APIVersion: "TDV2.0.0",
    InstallmentMaturityCommisionFlag: 0,
    HashData: "",
    SubMerchantId: 0,
    CardType: "Visa",
    BatchID: 0,
    TransactionType: "GetMerchantOrderDetail",
    InstallmentCount: 0,
    Amount: 0,
    DisplayAmount: 0,
    CancelAmount: 0,
    MerchantOrderId: query.id,
    CurrencyCode: mapCurrencyCode(query.currency),
    FECAmount: 0,
    QeryId: 0,
    DebtId: 0,
    SurchargeAmount: 0,
    SGKDebtAmount: 0,
    TransactionSecurity: 1
  };
  vPosMessage.HashData = createHash(account, vPosMessage);

  return {
    IsFromExternalNetwork: true,
    BusinessKey: 0,
    ResourceId: 0,
    ActionId: 0,
    LanguageId: 0,
    CustomerId: Number(account.customerId),
    MailOrTelephoneOrder: true,
    Amount: 0,
    MerchantId: account.merchantId,
    MerchantOrderId: query.id,
    OrderId: query.remoteOrderId ? normalizeRemoteOrderId(query.remoteOrderId) : 0,
    StartDate: formatSoapDate(startDate),
    EndDate: formatSoapDate(endDate),
    TransactionType: 0,
    VPosMessage: vPosMessage
  };
}

export function buildCancelRequestData(order: KuveytCancelOrder, account: KuveytAccount) {
  const amount = formatGatewayAmount(order.amountCents);
  const vPosMessage: Record<string, any> = {
    MerchantId: account.merchantId,
    CustomerId: account.customerId,
    UserName: account.userName,
    APIVersion: "TDV2.0.0",
    InstallmentMaturityCommisionFlag: 0,
    HashData: "",
    SubMerchantId: 0,
    CardType: "Visa",
    BatchID: 0,
    TransactionType: "SaleReversal",
    InstallmentCount: 0,
    Amount: amount,
    DisplayAmount: amount,
    CancelAmount: amount,
    MerchantOrderId: order.id,
    FECAmount: 0,
    CurrencyCode: mapCurrencyCode(order.currency),
    QeryId: 0,
    DebtId: 0,
    SurchargeAmount: 0,
    SGKDebtAmount: 0,
    TransactionSecurity: 1
  };
  vPosMessage.HashData = createHash(account, vPosMessage);

  return {
    IsFromExternalNetwork: true,
    BusinessKey: 0,
    ResourceId: 0,
    ActionId: 0,
    LanguageId: 0,
    CustomerId: account.customerId,
    MailOrTelephoneOrder: true,
    Amount: amount,
    MerchantId: account.merchantId,
    OrderId: normalizeRemoteOrderId(order.remoteOrderId),
    RRN: order.refRetNum,
    Stan: order.transactionId,
    ProvisionNumber: order.authCode,
    VPosMessage: vPosMessage
  };
}

export function buildRefundRequestData(order: KuveytRefundOrder, account: KuveytAccount) {
  const amount = formatGatewayAmount(order.amountCents);
  const transactionType = order.isPartial ? "PartialDrawback" : "DrawBack";
  const vPosMessage: Record<string, any> = {
    MerchantId: account.merchantId,
    CustomerId: account.customerId,
    UserName: account.userName,
    APIVersion: "TDV2.0.0",
    InstallmentMaturityCommisionFlag: 0,
    HashData: "",
    SubMerchantId: 0,
    CardType: "Visa",
    BatchID: 0,
    TransactionType: transactionType,
    InstallmentCount: 0,
    Amount: amount,
    DisplayAmount: 0,
    CancelAmount: amount,
    MerchantOrderId: order.id,
    FECAmount: 0,
    CurrencyCode: mapCurrencyCode(order.currency),
    QeryId: 0,
    DebtId: 0,
    SurchargeAmount: 0,
    SGKDebtAmount: 0,
    TransactionSecurity: 1
  };
  vPosMessage.HashData = createHash(account, vPosMessage);

  return {
    IsFromExternalNetwork: true,
    BusinessKey: 0,
    ResourceId: 0,
    ActionId: 0,
    LanguageId: 0,
    CustomerId: account.customerId,
    MailOrTelephoneOrder: true,
    Amount: amount,
    MerchantId: account.merchantId,
    OrderId: normalizeRemoteOrderId(order.remoteOrderId),
    RRN: order.refRetNum,
    Stan: order.transactionId,
    ProvisionNumber: order.authCode,
    VPosMessage: vPosMessage
  };
}

function normalizeExpiry(value: string, length: number) {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= length) {
    return digits.slice(-length);
  }
  return digits.padStart(length, "0");
}

function normalizeInstallment(installment: number | string) {
  const parsed = typeof installment === "string" ? Number(installment) : installment;
  if (!parsed || parsed <= 1) return "0";
  return String(parsed);
}

function normalizeCardNumber(value: string) {
  return value.replace(/\s+/g, "");
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("90")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function detectCardType(value: string): KuveytCard["type"] {
  const digits = normalizeCardNumber(value);
  if (digits.startsWith("4")) return "Visa";
  if (digits.startsWith("5") || digits.startsWith("2")) return "MasterCard";
  if (digits.startsWith("9792")) return "Troy";
  return "";
}

function createHash(account: KuveytAccount, requestData: Record<string, any>) {
  const hashedPassword = sha1Base64(account.storeKey);
  const rawHash = [
    requestData.MerchantId,
    requestData.MerchantOrderId ?? "",
    requestData.Amount ?? "",
    requestData.OkUrl ?? "",
    requestData.FailUrl ?? "",
    requestData.UserName,
    hashedPassword
  ].join("");
  return sha1Base64(rawHash);
}

function sha1Base64(value: string) {
  return crypto.createHash("sha1").update(value, "utf8").digest("base64");
}

function formatGatewayAmount(amountCents: number) {
  return String(Math.round(amountCents));
}

function mapCurrencyCode(currency: string) {
  return CURRENCY_CODES[currency] ?? currency;
}

function formatSoapDate(date: Date) {
  return date.toISOString().slice(0, 19);
}

function normalizeRemoteOrderId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildSoapEnvelope(action: string, requestData: Record<string, any>) {
  const xmlBody = builder.build({
    "soap:Envelope": {
      "@_xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
      "soap:Body": {
        [action]: {
          "@_xmlns": SOAP_NAMESPACE,
          request: requestData
        }
      }
    }
  });
  return `<?xml version="1.0" encoding="utf-8"?>${xmlBody}`;
}

function parseKuveytSoapResponse(xml: string, action: string) {
  const parsed = soapParser.parse(xml);
  const envelope = parsed?.Envelope ?? parsed?.["soap:Envelope"] ?? parsed?.["s:Envelope"];
  const body = envelope?.Body ?? envelope?.["soap:Body"] ?? envelope?.["s:Body"];
  if (!body) return {};
  if (body.Fault) {
    const message = body.Fault.faultstring || body.Fault.faultcode || "SOAP Fault";
    throw new Error(message);
  }
  const responseKey = `${action}Response`;
  const response = body[responseKey] ?? body;
  const resultKey = `${action}Result`;
  return response?.[resultKey] ?? response;
}
