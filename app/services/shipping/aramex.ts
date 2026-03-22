/**
 * Aramex shipping integration.
 * Aramex is a leading logistics and courier service across the MENA region.
 * Uses SOAP API — this module wraps SOAP XML requests into a clean async interface.
 */

export interface AramexConfig {
  accountNumber: string;
  accountPin: string;
  accountEntity: string;
  accountCountryCode: string;
  username: string;
  password: string;
  sandbox: boolean;
}

export interface AramexAddress {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode: string;
  company?: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface AramexShipment {
  reference: string;
  origin: AramexAddress;
  destination: AramexAddress;
  weight: number;
  numberOfPieces: number;
  description: string;
  cashOnDeliveryAmount?: number;
  cashOnDeliveryCurrency?: string;
  productGroup?: "EXP" | "DOM";
  productType?: string;
  serviceType?: string;
}

export interface AramexShipmentResult {
  trackingNumber: string;
  labelUrl: string;
}

export interface AramexTrackingEvent {
  timestamp: Date;
  location: string;
  description: string;
  code: string;
}

export interface AramexTrackingResult {
  status: string;
  events: AramexTrackingEvent[];
}

export interface AramexRateResult {
  rate: number;
  currency: string;
  estimatedDays: number;
}

export interface AramexPickupLocation {
  name: string;
  address: string;
}

const ARAMEX_SANDBOX_URL = "https://ws.dev.aramex.net/";
const ARAMEX_PRODUCTION_URL = "https://ws.aramex.net/";

function getBaseUrl(sandbox: boolean): string {
  return sandbox ? ARAMEX_SANDBOX_URL : ARAMEX_PRODUCTION_URL;
}

/**
 * Build Aramex SOAP XML envelope with ClientInfo authentication.
 */
function buildSoapEnvelope(config: AramexConfig, action: string, body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:arr="http://ws.aramex.net/ShippingAPI/v1/">
  <soap:Header/>
  <soap:Body>
    <arr:${action}>
      <arr:ClientInfo>
        <arr:UserName>${escapeXml(config.username)}</arr:UserName>
        <arr:Password>${escapeXml(config.password)}</arr:Password>
        <arr:AccountNumber>${escapeXml(config.accountNumber)}</arr:AccountNumber>
        <arr:AccountPin>${escapeXml(config.accountPin)}</arr:AccountPin>
        <arr:AccountEntity>${escapeXml(config.accountEntity)}</arr:AccountEntity>
        <arr:AccountCountryCode>${escapeXml(config.accountCountryCode)}</arr:AccountCountryCode>
        <arr:Version>v1</arr:Version>
      </arr:ClientInfo>
      ${body}
    </arr:${action}>
  </soap:Body>
</soap:Envelope>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildAddressXml(tag: string, address: AramexAddress): string {
  return `<arr:${tag}>
  <arr:Line1>${escapeXml(address.line1)}</arr:Line1>
  <arr:Line2>${escapeXml(address.line2 ?? "")}</arr:Line2>
  <arr:Line3>${escapeXml(address.line3 ?? "")}</arr:Line3>
  <arr:City>${escapeXml(address.city)}</arr:City>
  <arr:StateOrProvinceCode>${escapeXml(address.stateOrProvince ?? "")}</arr:StateOrProvinceCode>
  <arr:PostCode>${escapeXml(address.postalCode ?? "")}</arr:PostCode>
  <arr:CountryCode>${escapeXml(address.countryCode)}</arr:CountryCode>
</arr:${tag}>`;
}

function buildContactXml(tag: string, address: AramexAddress): string {
  return `<arr:${tag}>
  <arr:PersonName>${escapeXml(address.contactName)}</arr:PersonName>
  <arr:CompanyName>${escapeXml(address.company ?? "")}</arr:CompanyName>
  <arr:PhoneNumber1>${escapeXml(address.phone)}</arr:PhoneNumber1>
  <arr:CellPhone>${escapeXml(address.phone)}</arr:CellPhone>
  <arr:EmailAddress>${escapeXml(address.email)}</arr:EmailAddress>
</arr:${tag}>`;
}

/**
 * Send a SOAP request to Aramex and return the parsed XML response body as text.
 */
async function soapRequest(
  config: AramexConfig,
  servicePath: string,
  soapAction: string,
  xmlBody: string,
): Promise<string> {
  const baseUrl = getBaseUrl(config.sandbox);
  const envelope = buildSoapEnvelope(config, soapAction, xmlBody);

  const response = await fetch(`${baseUrl}${servicePath}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `http://ws.aramex.net/ShippingAPI/v1/${soapAction}`,
    },
    body: envelope,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Aramex SOAP error (${response.status}): ${error}`);
  }

  return response.text();
}

/**
 * Extract a single XML element value from a SOAP response.
 */
function extractXmlValue(xml: string, tag: string): string {
  const regex = new RegExp(`<[^:]*:?${tag}[^>]*>([^<]*)<`, "i");
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? "";
}

/**
 * Extract all occurrences of a tag block from XML.
 */
function extractXmlBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<[^:]*:?${tag}[^>]*>[\\s\\S]*?</[^:]*:?${tag}>`, "gi");
  return xml.match(regex) ?? [];
}

/**
 * Create a shipment with Aramex.
 */
export async function createShipment(
  config: AramexConfig,
  shipment: AramexShipment,
): Promise<AramexShipmentResult> {
  const body = `
    <arr:Shipments>
      <arr:Shipment>
        <arr:Reference1>${escapeXml(shipment.reference)}</arr:Reference1>
        <arr:Shipper>
          ${buildContactXml("Contact", shipment.origin)}
          ${buildAddressXml("Party", shipment.origin)}
        </arr:Shipper>
        <arr:Consignee>
          ${buildContactXml("Contact", shipment.destination)}
          ${buildAddressXml("Party", shipment.destination)}
        </arr:Consignee>
        <arr:ShippingDateTime>${new Date().toISOString()}</arr:ShippingDateTime>
        <arr:DueDate>${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()}</arr:DueDate>
        <arr:Details>
          <arr:Dimensions>
            <arr:Length>0</arr:Length>
            <arr:Width>0</arr:Width>
            <arr:Height>0</arr:Height>
            <arr:Unit>CM</arr:Unit>
          </arr:Dimensions>
          <arr:ActualWeight>
            <arr:Value>${shipment.weight}</arr:Value>
            <arr:Unit>KG</arr:Unit>
          </arr:ActualWeight>
          <arr:NumberOfPieces>${shipment.numberOfPieces}</arr:NumberOfPieces>
          <arr:ProductGroup>${escapeXml(shipment.productGroup ?? "EXP")}</arr:ProductGroup>
          <arr:ProductType>${escapeXml(shipment.productType ?? "PPX")}</arr:ProductType>
          <arr:PaymentType>P</arr:PaymentType>
          <arr:DescriptionOfGoods>${escapeXml(shipment.description)}</arr:DescriptionOfGoods>
          ${
            shipment.cashOnDeliveryAmount
              ? `<arr:CashOnDeliveryAmount>
                  <arr:Value>${shipment.cashOnDeliveryAmount}</arr:Value>
                  <arr:CurrencyCode>${escapeXml(shipment.cashOnDeliveryCurrency ?? "SAR")}</arr:CurrencyCode>
                </arr:CashOnDeliveryAmount>`
              : ""
          }
        </arr:Details>
      </arr:Shipment>
    </arr:Shipments>
    <arr:LabelInfo>
      <arr:ReportID>9201</arr:ReportID>
      <arr:ReportType>URL</arr:ReportType>
    </arr:LabelInfo>`;

  const responseXml = await soapRequest(
    config,
    "ShippingAPI.V2/Shipping/Service_1_0.svc",
    "CreateShipments",
    body,
  );

  const trackingNumber = extractXmlValue(responseXml, "ID");
  const labelUrl = extractXmlValue(responseXml, "LabelURL");

  if (!trackingNumber) {
    const errorMessage = extractXmlValue(responseXml, "Message");
    throw new Error(`Aramex shipment creation failed: ${errorMessage || "Unknown error"}`);
  }

  return { trackingNumber, labelUrl };
}

/**
 * Track a shipment by tracking number.
 */
export async function trackShipment(
  config: AramexConfig,
  trackingNumber: string,
): Promise<AramexTrackingResult> {
  const body = `
    <arr:Shipments>
      <arr:string>${escapeXml(trackingNumber)}</arr:string>
    </arr:Shipments>
    <arr:GetLastTrackingUpdateOnly>false</arr:GetLastTrackingUpdateOnly>`;

  const responseXml = await soapRequest(
    config,
    "ShippingAPI.V2/Tracking/Service_1_0.svc",
    "TrackShipments",
    body,
  );

  const eventBlocks = extractXmlBlocks(responseXml, "TrackingResult");
  const events: AramexTrackingEvent[] = eventBlocks.map((block) => ({
    timestamp: new Date(extractXmlValue(block, "UpdateDateTime") || new Date().toISOString()),
    location: extractXmlValue(block, "UpdateLocation"),
    description: extractXmlValue(block, "UpdateDescription"),
    code: extractXmlValue(block, "UpdateCode"),
  }));

  const latestEvent = events[0];
  const status = latestEvent?.description ?? "Unknown";

  return { status, events };
}

/**
 * Calculate shipping rate for a given origin, destination, and weight.
 */
export async function calculateRate(
  config: AramexConfig,
  origin: AramexAddress,
  destination: AramexAddress,
  weight: number,
): Promise<AramexRateResult> {
  const body = `
    <arr:OriginAddress>
      <arr:City>${escapeXml(origin.city)}</arr:City>
      <arr:CountryCode>${escapeXml(origin.countryCode)}</arr:CountryCode>
    </arr:OriginAddress>
    <arr:DestinationAddress>
      <arr:City>${escapeXml(destination.city)}</arr:City>
      <arr:CountryCode>${escapeXml(destination.countryCode)}</arr:CountryCode>
    </arr:DestinationAddress>
    <arr:ShipmentDetails>
      <arr:ActualWeight>
        <arr:Value>${weight}</arr:Value>
        <arr:Unit>KG</arr:Unit>
      </arr:ActualWeight>
      <arr:NumberOfPieces>1</arr:NumberOfPieces>
      <arr:ProductGroup>EXP</arr:ProductGroup>
      <arr:ProductType>PPX</arr:ProductType>
      <arr:PaymentType>P</arr:PaymentType>
    </arr:ShipmentDetails>
    <arr:PreferredCurrencyCode>SAR</arr:PreferredCurrencyCode>`;

  const responseXml = await soapRequest(
    config,
    "ShippingAPI.V2/RateCalculator/Service_1_0.svc",
    "CalculateRate",
    body,
  );

  const totalAmount = extractXmlValue(responseXml, "Value");
  const currency = extractXmlValue(responseXml, "CurrencyCode") || "SAR";

  return {
    rate: Number(totalAmount) || 0,
    currency,
    estimatedDays: estimateDeliveryDays(origin.countryCode, destination.countryCode),
  };
}

/**
 * Get available pickup locations for a city and country.
 */
export async function getPickupLocations(
  config: AramexConfig,
  city: string,
  country: string,
): Promise<AramexPickupLocation[]> {
  const body = `
    <arr:CountryCode>${escapeXml(country)}</arr:CountryCode>
    <arr:City>${escapeXml(city)}</arr:City>`;

  const responseXml = await soapRequest(
    config,
    "ShippingAPI.V2/Location/Service_1_0.svc",
    "FetchOffices",
    body,
  );

  const officeBlocks = extractXmlBlocks(responseXml, "Office");
  return officeBlocks.map((block) => ({
    name: extractXmlValue(block, "OfficeName") || extractXmlValue(block, "Name"),
    address: [
      extractXmlValue(block, "Line1"),
      extractXmlValue(block, "City"),
      extractXmlValue(block, "CountryCode"),
    ]
      .filter(Boolean)
      .join(", "),
  }));
}

/**
 * Estimate delivery days based on origin and destination countries.
 */
function estimateDeliveryDays(originCountry: string, destCountry: string): number {
  if (originCountry === destCountry) return 2;
  const gccCountries = new Set(["SA", "AE", "BH", "KW", "QA", "OM"]);
  if (gccCountries.has(originCountry) && gccCountries.has(destCountry)) return 3;
  return 5;
}
