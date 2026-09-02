import path from "node:path";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Order } from "@/store/orderStore";

const LOGO_PATH = path.join(
  process.cwd(),
  "public/annvriksh_logo_horizontal.png",
);

// The base-14 PDF fonts (Helvetica etc.) have no ₹ (Rupee) glyph, which
// silently renders as the wrong character. Roboto covers it, so every piece
// of text in this document uses it instead.
Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf") },
    {
      src: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

export const SELLER = {
  name: "ANNVRIKSH",
  address:
    "B-11/1275, Bhagwati Street, Gali No. 10A, Kirti Nagar, Near Jai Shree High School, Sirsa, Haryana – 125055, India",
  state: "Haryana",
  stateCode: "06",
  gstin: "06AYVPK4873C1Z2",
  fssai: "20826019001149",
};

const GST_RATE = 5; // Flat rate across all products, GST-inclusive pricing.

/** April–March Indian financial year, e.g. "2026-27". */
export function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const isBeforeApril = date.getMonth() < 3; // Jan–Mar still belongs to the prior FY.
  const startYear = isBeforeApril ? year - 1 : year;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function formatInvoiceNumber(financialYear: string, sequence: number) {
  return `ANV/${financialYear}/${String(sequence).padStart(4, "0")}`;
}

// GST state codes (Schedule III, CGST Act). Buyer state is free-text at
// checkout, so lookups are case-insensitive and tolerant of "&"/"and".
const STATE_CODES: Record<string, string> = {
  "jammu and kashmir": "01",
  "himachal pradesh": "02",
  punjab: "03",
  chandigarh: "04",
  uttarakhand: "05",
  uttaranchal: "05",
  haryana: "06",
  delhi: "07",
  "new delhi": "07",
  "nct of delhi": "07",
  rajasthan: "08",
  "uttar pradesh": "09",
  bihar: "10",
  sikkim: "11",
  "arunachal pradesh": "12",
  nagaland: "13",
  manipur: "14",
  mizoram: "15",
  tripura: "16",
  meghalaya: "17",
  assam: "18",
  "west bengal": "19",
  jharkhand: "20",
  odisha: "21",
  orissa: "21",
  chhattisgarh: "22",
  "madhya pradesh": "23",
  gujarat: "24",
  "daman and diu": "25",
  "dadra and nagar haveli": "26",
  maharashtra: "27",
  karnataka: "29",
  goa: "30",
  lakshadweep: "31",
  kerala: "32",
  "tamil nadu": "33",
  puducherry: "34",
  pondicherry: "34",
  "andaman and nicobar islands": "35",
  telangana: "36",
  "andhra pradesh": "37",
  ladakh: "38",
};

function normalizeStateKey(state: string) {
  return state.trim().toLowerCase().replace(/&/g, "and");
}

function getStateCode(state: string | null | undefined): string | null {
  if (!state) return null;
  const key = normalizeStateKey(state);
  if (STATE_CODES[key]) return STATE_CODES[key];
  const match = Object.keys(STATE_CODES).find(
    (k) => key.includes(k) || k.includes(key),
  );
  return match ? STATE_CODES[match] : null;
}

/** Buyer state is free-text at checkout — fuzzy, tolerant match against the
 * seller's registered state (Haryana) to decide CGST+SGST vs IGST. */
function isIntraState(buyerState: string | null | undefined): boolean {
  if (!buyerState) return false;
  return normalizeStateKey(buyerState).includes("haryana");
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Splits a GST-inclusive amount into its taxable value and tax component. */
function splitInclusiveTax(inclusiveAmount: number) {
  const taxableValue = round2(inclusiveAmount / (1 + GST_RATE / 100));
  const taxAmount = round2(inclusiveAmount - taxableValue);
  return { taxableValue, taxAmount };
}

// ---- Amount in words (Indian numbering system) --------------------------

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + (ones ? ` ${ONES[ones]}` : "");
}

function threeDigitWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return (
    (hundreds ? `${ONES[hundreds]} Hundred${rest ? " " : ""}` : "") +
    (rest ? twoDigitWords(rest) : "")
  );
}

function integerToIndianWords(value: number): string {
  if (value === 0) return "Zero";
  let n = value;
  let result = "";
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;

  if (crore) result += `${threeDigitWords(crore)} Crore `;
  if (lakh) result += `${twoDigitWords(lakh)} Lakh `;
  if (thousand) result += `${twoDigitWords(thousand)} Thousand `;
  if (rest) result += threeDigitWords(rest);

  return result.trim();
}

function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = `${integerToIndianWords(rupees)} Rupee${rupees === 1 ? "" : "s"}`;
  if (paise > 0) {
    words += ` and ${integerToIndianWords(paise)} Paise`;
  }
  return `${words} Only`;
}

// ---- Styles ---------------------------------------------------------------

const COLORS = {
  dark: "#112C24",
  gold: "#C5A028",
  cream: "#FAF6EC",
  border: "#E2D9C4",
  text: "#2A2620",
  muted: "#4A4438",
  faint: "#8A7F6B",
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8.5,
    fontFamily: "Roboto",
    color: COLORS.text,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 7,
  },
  logo: {
    width: 130,
    height: 43,
    objectFit: "contain",
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    color: COLORS.dark,
    letterSpacing: 1,
  },
  invoiceSubtitle: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "right",
    color: COLORS.gold,
    letterSpacing: 1.2,
    marginTop: 2,
    textTransform: "uppercase",
  },
  sellerBand: {
    backgroundColor: COLORS.cream,
    border: `1 solid ${COLORS.border}`,
    padding: 5,
    marginBottom: 7,
  },
  sellerLine1: { fontSize: 8, color: COLORS.text, lineHeight: 1.3 },
  sellerLine2: { fontSize: 7.5, color: COLORS.muted, marginTop: 2 },
  detailsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 7,
  },
  detailsCol: {
    width: "33.33%",
    border: `1 solid ${COLORS.border}`,
    padding: 5,
  },
  colLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.gold,
    letterSpacing: 0.6,
    marginBottom: 3,
    textTransform: "uppercase",
    borderBottom: `1 solid ${COLORS.border}`,
    paddingBottom: 2,
  },
  detailLine: { fontSize: 7.6, color: COLORS.text, lineHeight: 1.35 },
  detailLineMuted: { fontSize: 6.8, color: COLORS.faint, lineHeight: 1.35 },
  table: {
    borderTop: `1 solid ${COLORS.border}`,
    borderLeft: `1 solid ${COLORS.border}`,
  },
  tableRow: { flexDirection: "row" },
  tableHeaderCell: {
    backgroundColor: COLORS.dark,
    color: "#FDFBF7",
    fontWeight: "bold",
    fontSize: 6.2,
    padding: 3,
    borderRight: `1 solid ${COLORS.border}`,
    textTransform: "uppercase",
  },
  tableCell: {
    fontSize: 6.8,
    padding: 3,
    borderRight: `1 solid ${COLORS.border}`,
    borderBottom: `1 solid ${COLORS.border}`,
  },
  tableCellMuted: {
    fontSize: 6,
    color: COLORS.faint,
    marginTop: 1,
  },
  totalGoodsRow: {
    backgroundColor: COLORS.cream,
  },
  totalGoodsLabel: {
    fontSize: 6.8,
    fontWeight: "bold",
    padding: 3,
    borderRight: `1 solid ${COLORS.border}`,
    borderBottom: `1 solid ${COLORS.border}`,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  hsnBox: { width: "48%" },
  chargesBox: { width: "52%" },
  boxTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.gold,
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  hsnTable: {
    borderTop: `1 solid ${COLORS.border}`,
    borderLeft: `1 solid ${COLORS.border}`,
  },
  hsnHeaderCell: {
    backgroundColor: COLORS.dark,
    color: "#FDFBF7",
    fontWeight: "bold",
    fontSize: 6,
    padding: 2.5,
    borderRight: `1 solid ${COLORS.border}`,
    textTransform: "uppercase",
    textAlign: "center",
  },
  hsnCell: {
    fontSize: 6.5,
    padding: 2.5,
    borderRight: `1 solid ${COLORS.border}`,
    borderBottom: `1 solid ${COLORS.border}`,
    textAlign: "center",
  },
  hsnTotalRow: { backgroundColor: COLORS.cream },
  hsnColHsn: { width: "30%" },
  hsnColTaxable: { width: "20%" },
  hsnColRate: { width: "12%" },
  hsnColTax: { width: "18%" },
  hsnColTotal: { width: "20%" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1.6,
    paddingHorizontal: 2,
  },
  summaryLabel: { fontSize: 7.4, color: COLORS.muted },
  summaryValue: { fontSize: 7.4, color: COLORS.text },
  summaryDivider: {
    borderTop: `1 solid ${COLORS.border}`,
    marginVertical: 2,
  },
  summaryBold: { fontSize: 7.8, fontWeight: "bold", color: COLORS.dark },
  payableBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.dark,
    padding: 5,
    marginTop: 3,
  },
  payableLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#FDFBF7",
    letterSpacing: 0.5,
  },
  payableValue: { fontSize: 8.5, fontWeight: "bold", color: "#FDFBF7" },
  amountWords: {
    fontSize: 6.8,
    color: COLORS.muted,
    marginTop: 3,
    paddingHorizontal: 2,
    lineHeight: 1.3,
  },
  declareRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  declareCol: { width: "100%" },
  declareTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.gold,
    letterSpacing: 0.6,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  declareNote: {
    fontSize: 6.1,
    color: COLORS.muted,
    lineHeight: 1.3,
    marginBottom: 2,
  },
  computerGenerated: {
    fontSize: 6.1,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 30,
    right: 30,
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLORS.gold,
    textAlign: "center",
    borderTop: `1 solid ${COLORS.border}`,
    paddingTop: 8,
    letterSpacing: 1.5,
  },
});

export type InvoiceItemInput = {
  name: string;
  weight?: string;
  quantity: number;
  price: number;
  hsnCode: string | null;
};

export function InvoiceDocument({
  order,
  invoiceNumber,
  items,
}: {
  order: Order;
  invoiceNumber: string;
  items: InvoiceItemInput[];
}) {
  const buyer = order.delivery_address;
  const intraState = isIntraState(buyer?.state);
  const buyerStateCode = getStateCode(buyer?.state);
  const sellerStateLabel = `${SELLER.state} (${SELLER.stateCode})`;
  const buyerStateLabel = buyer?.state
    ? `${buyer.state}${buyerStateCode ? ` (${buyerStateCode})` : ""}`
    : "-";

  const invoiceDate = new Date(
    order.invoice_generated_at ?? order.created_at,
  ).toLocaleDateString("en-GB");

  // Fixed column widths (percent) for the line-items table — computed once
  // so the header, body rows, and the merged "TOTAL — GOODS" label always
  // sum to exactly 100% and line up under one another.
  const COL = intraState
    ? { sno: 4, desc: 24, hsn: 9, qty: 5, rate: 8, amount: 9, taxable: 10, tax1: 9, tax2: 9, total: 13 }
    : { sno: 4, desc: 32, hsn: 9, qty: 5, rate: 8, amount: 9, taxable: 10, tax1: 10, tax2: 0, total: 13 };
  const spanLabelWidth = COL.sno + COL.desc + COL.hsn + COL.qty + COL.rate;

  // --- Line-item math -------------------------------------------------
  // The coupon discount is an order-level amount, not itemizable per
  // product, so it's apportioned pro-rata across every line — the same
  // ratio the reference invoice format uses.
  const subtotal =
    order.subtotal_amount ??
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = round2(order.coupon_discount_amount ?? 0);
  const discountRatio = subtotal > 0 ? Math.max(0, (subtotal - couponDiscount) / subtotal) : 1;
  const discountPercent = subtotal > 0 ? round2((couponDiscount / subtotal) * 100) : 0;

  const lines = items.map((item) => {
    const amount = round2(item.price * item.quantity);
    const total = round2(amount * discountRatio);
    const { taxableValue, taxAmount } = splitInclusiveTax(total);
    const cgst = intraState ? round2(taxAmount / 2) : 0;
    const sgst = intraState ? round2(taxAmount - cgst) : 0;
    const igst = intraState ? 0 : taxAmount;
    return {
      name: item.name,
      weight: item.weight,
      hsnCode: item.hsnCode ?? "-",
      quantity: item.quantity,
      rate: item.price,
      amount,
      total,
      taxableValue,
      taxAmount,
      cgst,
      sgst,
      igst,
    };
  });

  const goodsGross = round2(lines.reduce((s, l) => s + l.amount, 0));
  const goodsNet = round2(lines.reduce((s, l) => s + l.total, 0));
  const goodsTaxable = round2(lines.reduce((s, l) => s + l.taxableValue, 0));
  const goodsCgst = round2(lines.reduce((s, l) => s + l.cgst, 0));
  const goodsSgst = round2(lines.reduce((s, l) => s + l.sgst, 0));
  const goodsIgst = round2(lines.reduce((s, l) => s + l.igst, 0));

  const shipping = round2(order.shipping_amount ?? 0);
  const convenienceFee = round2(order.convenience_fee_amount ?? 0);
  const codFee = round2(order.cod_amount ?? 0);

  // Shipping, convenience and COD charges are incidental to the supply of
  // goods (Sec. 15(2)(c)) and taxed at the same rate — but each is its own
  // named charge on the invoice, not merged into one bucket.
  const extraCharges: { label: string; amount: number }[] = [];
  if (shipping > 0) extraCharges.push({ label: "Shipping & Handling", amount: shipping });
  if (convenienceFee > 0) extraCharges.push({ label: "Convenience Fee", amount: convenienceFee });
  if (codFee > 0) extraCharges.push({ label: "COD Charge", amount: codFee });

  const extraChargeRows = extraCharges.map((charge) => {
    const { taxableValue, taxAmount } = splitInclusiveTax(charge.amount);
    const cgst = intraState ? round2(taxAmount / 2) : 0;
    const sgst = intraState ? round2(taxAmount - cgst) : 0;
    const igst = intraState ? 0 : taxAmount;
    return { ...charge, taxableValue, cgst, sgst, igst };
  });

  const ancillaryAmount = round2(extraChargeRows.reduce((s, r) => s + r.amount, 0));
  const ancillaryTaxable = round2(extraChargeRows.reduce((s, r) => s + r.taxableValue, 0));
  const ancillaryCgst = round2(extraChargeRows.reduce((s, r) => s + r.cgst, 0));
  const ancillarySgst = round2(extraChargeRows.reduce((s, r) => s + r.sgst, 0));
  const ancillaryIgst = round2(extraChargeRows.reduce((s, r) => s + r.igst, 0));

  const totalInvoiceValue = round2(goodsNet + ancillaryAmount);
  const amountPayable = order.total_amount;

  const grandTaxable = round2(goodsTaxable + ancillaryTaxable);
  const grandCgst = round2(goodsCgst + ancillaryCgst);
  const grandSgst = round2(goodsSgst + ancillarySgst);
  const grandIgst = round2(goodsIgst + ancillaryIgst);

  // HSN/SAC-wise tax summary — group line items sharing an HSN code.
  const hsnRows: { hsn: string; taxable: number; cgst: number; sgst: number; igst: number; total: number }[] = [];
  lines.forEach((line) => {
    const existing = hsnRows.find((row) => row.hsn === line.hsnCode);
    if (existing) {
      existing.taxable = round2(existing.taxable + line.taxableValue);
      existing.cgst = round2(existing.cgst + line.cgst);
      existing.sgst = round2(existing.sgst + line.sgst);
      existing.igst = round2(existing.igst + line.igst);
      existing.total = round2(existing.total + line.total);
    } else {
      hsnRows.push({
        hsn: line.hsnCode,
        taxable: line.taxableValue,
        cgst: line.cgst,
        sgst: line.sgst,
        igst: line.igst,
        total: line.total,
      });
    }
  });

  const money = (value: number) => `₹${value.toFixed(2)}`;

  const declarationNotes: string[] = [
    "Prices listed are inclusive of GST; taxable value has been derived by back-calculation under Rule 35 of the CGST Rules, 2017.",
  ];
  if (couponDiscount > 0) {
    declarationNotes.push(
      `Discount of ${money(couponDiscount)} has been allowed at the time of supply, shown on the face of this invoice and apportioned pro-rata across line items, and is therefore deducted from the value of supply under Section 15(3)(a) of the CGST Act, 2017.`,
    );
  }
  if (ancillaryAmount > 0) {
    declarationNotes.push(
      "Shipping & handling and convenience fee are incidental charges forming part of the value of supply under Section 15(2)(c) and, being ancillary to a composite supply of goods, are taxed at the rate applicable to the principal supply.",
    );
  }
  declarationNotes.push(
    intraState
      ? `Supplier and place of supply are both in ${sellerStateLabel}; accordingly CGST and SGST are charged under Section 9 of the CGST Act, 2017 and the Haryana GST Act, 2017.`
      : `Supplier is in ${sellerStateLabel} and place of supply is ${buyerStateLabel}; accordingly IGST is charged under Section 5 of the IGST Act, 2017 in lieu of CGST and SGST.`,
  );
  declarationNotes.push(
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML/next Image; it has no alt prop. */}
          <Image style={styles.logo} src={LOGO_PATH} />
          <View>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceSubtitle}>Original for Recipient</Text>
          </View>
        </View>

        <View style={styles.sellerBand}>
          <Text style={styles.sellerLine1}>
            {SELLER.name} | {SELLER.address}
          </Text>
          <Text style={styles.sellerLine2}>
            GSTIN: {SELLER.gstin} {"•"} FSSAI Lic. No.: {SELLER.fssai} {"•"} State: {sellerStateLabel}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailsCol}>
            <Text style={styles.colLabel}>Invoice Details</Text>
            <Text style={styles.detailLine}>Invoice No.: {invoiceNumber}</Text>
            <Text style={styles.detailLine}>Invoice Date: {invoiceDate}</Text>
            <Text style={styles.detailLine}>Place of Supply: {buyerStateLabel}</Text>
            <Text style={styles.detailLine}>
              Supply Type: {intraState ? "Intra-State" : "Inter-State"} {"—"} B2C
            </Text>
            <Text style={styles.detailLine}>Reverse Charge: No</Text>
            <Text style={styles.detailLineMuted}>Order Ref: {order.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.detailsCol}>
            <Text style={styles.colLabel}>Billed To</Text>
            <Text style={styles.detailLine}>{buyer?.name}</Text>
            <Text style={styles.detailLine}>{buyer?.address}</Text>
            <Text style={styles.detailLine}>
              {buyer?.city}, {buyer?.state} {"–"} {buyer?.zipCode}
            </Text>
            {buyer?.phone && <Text style={styles.detailLine}>Phone: {buyer.phone}</Text>}
            <Text style={styles.detailLine}>GSTIN: Unregistered</Text>
          </View>
          <View style={styles.detailsCol}>
            <Text style={styles.colLabel}>Shipped To</Text>
            <Text style={styles.detailLine}>{buyer?.name}</Text>
            <Text style={styles.detailLine}>{buyer?.address}</Text>
            <Text style={styles.detailLine}>
              {buyer?.city}, {buyer?.state} {"–"} {buyer?.zipCode}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.sno}%` }}>#</Text>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.desc}%` }}>
              Description of Goods
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.hsn}%`, textAlign: "center" }}>HSN</Text>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.qty}%`, textAlign: "center" }}>Qty</Text>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.rate}%`, textAlign: "right" }}>Rate</Text>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.amount}%`, textAlign: "right" }}>Amount</Text>
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.taxable}%`, textAlign: "right" }}>Taxable Value</Text>
            {intraState ? (
              <>
                <Text style={{ ...styles.tableHeaderCell, width: `${COL.tax1}%`, textAlign: "right" }}>CGST @2.5%</Text>
                <Text style={{ ...styles.tableHeaderCell, width: `${COL.tax2}%`, textAlign: "right" }}>SGST @2.5%</Text>
              </>
            ) : (
              <Text style={{ ...styles.tableHeaderCell, width: `${COL.tax1}%`, textAlign: "right" }}>IGST @5%</Text>
            )}
            <Text style={{ ...styles.tableHeaderCell, width: `${COL.total}%`, textAlign: "right", borderRight: "none" }}>
              Total
            </Text>
          </View>
          {lines.map((line, index) => (
            <View style={styles.tableRow} key={`${line.name}-${index}`}>
              <Text style={{ ...styles.tableCell, width: `${COL.sno}%` }}>{index + 1}</Text>
              <View style={{ ...styles.tableCell, width: `${COL.desc}%` }}>
                <Text>{line.name}</Text>
                {line.weight && <Text style={styles.tableCellMuted}>Net Qty: {line.weight}</Text>}
              </View>
              <Text style={{ ...styles.tableCell, width: `${COL.hsn}%`, textAlign: "center" }}>{line.hsnCode}</Text>
              <Text style={{ ...styles.tableCell, width: `${COL.qty}%`, textAlign: "center" }}>{line.quantity}</Text>
              <Text style={{ ...styles.tableCell, width: `${COL.rate}%`, textAlign: "right" }}>{line.rate.toFixed(2)}</Text>
              <Text style={{ ...styles.tableCell, width: `${COL.amount}%`, textAlign: "right" }}>{line.amount.toFixed(2)}</Text>
              <Text style={{ ...styles.tableCell, width: `${COL.taxable}%`, textAlign: "right" }}>{line.taxableValue.toFixed(2)}</Text>
              {intraState ? (
                <>
                  <Text style={{ ...styles.tableCell, width: `${COL.tax1}%`, textAlign: "right" }}>{line.cgst.toFixed(2)}</Text>
                  <Text style={{ ...styles.tableCell, width: `${COL.tax2}%`, textAlign: "right" }}>{line.sgst.toFixed(2)}</Text>
                </>
              ) : (
                <Text style={{ ...styles.tableCell, width: `${COL.tax1}%`, textAlign: "right" }}>{line.igst.toFixed(2)}</Text>
              )}
              <Text style={{ ...styles.tableCell, width: `${COL.total}%`, textAlign: "right", fontWeight: "bold", borderRight: "none" }}>
                {money(line.total)}
              </Text>
            </View>
          ))}
          <View style={{ ...styles.tableRow, ...styles.totalGoodsRow }}>
            <Text
              style={{
                ...styles.totalGoodsLabel,
                width: `${spanLabelWidth}%`,
                textAlign: "right",
              }}
            >
              TOTAL — GOODS
            </Text>
            <Text style={{ ...styles.totalGoodsLabel, width: `${COL.amount}%`, textAlign: "right" }}>{goodsGross.toFixed(2)}</Text>
            <Text style={{ ...styles.totalGoodsLabel, width: `${COL.taxable}%`, textAlign: "right" }}>{goodsTaxable.toFixed(2)}</Text>
            {intraState ? (
              <>
                <Text style={{ ...styles.totalGoodsLabel, width: `${COL.tax1}%`, textAlign: "right" }}>{goodsCgst.toFixed(2)}</Text>
                <Text style={{ ...styles.totalGoodsLabel, width: `${COL.tax2}%`, textAlign: "right" }}>{goodsSgst.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={{ ...styles.totalGoodsLabel, width: `${COL.tax1}%`, textAlign: "right" }}>{goodsIgst.toFixed(2)}</Text>
            )}
            <Text style={{ ...styles.totalGoodsLabel, width: `${COL.total}%`, textAlign: "right", borderRight: "none" }}>
              {money(goodsNet)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.hsnBox}>
            <Text style={styles.boxTitle}>HSN/SAC-wise Tax Summary</Text>
            <View style={styles.hsnTable}>
              <View style={styles.tableRow}>
                <Text style={{ ...styles.hsnHeaderCell, ...styles.hsnColHsn }}>HSN / Charge</Text>
                <Text style={{ ...styles.hsnHeaderCell, ...styles.hsnColTaxable }}>Taxable Value</Text>
                <Text style={{ ...styles.hsnHeaderCell, ...styles.hsnColRate }}>Rate</Text>
                <Text style={{ ...styles.hsnHeaderCell, ...styles.hsnColTax }}>{intraState ? "CGST+SGST" : "IGST"}</Text>
                <Text style={{ ...styles.hsnHeaderCell, ...styles.hsnColTotal, borderRight: "none" }}>Total</Text>
              </View>
              {hsnRows.map((row) => (
                <View style={styles.tableRow} key={row.hsn}>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColHsn }}>{row.hsn}</Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColTaxable }}>{row.taxable.toFixed(2)}</Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColRate }}>{GST_RATE}%</Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColTax }}>
                    {(intraState ? round2(row.cgst + row.sgst) : row.igst).toFixed(2)}
                  </Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColTotal, borderRight: "none" }}>{row.total.toFixed(2)}</Text>
                </View>
              ))}
              {extraChargeRows.map((charge) => (
                <View style={styles.tableRow} key={charge.label}>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColHsn }}>{charge.label}</Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColTaxable }}>{charge.taxableValue.toFixed(2)}</Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColRate }}>{GST_RATE}%</Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColTax }}>
                    {(intraState ? round2(charge.cgst + charge.sgst) : charge.igst).toFixed(2)}
                  </Text>
                  <Text style={{ ...styles.hsnCell, ...styles.hsnColTotal, borderRight: "none" }}>{charge.amount.toFixed(2)}</Text>
                </View>
              ))}
              <View style={{ ...styles.tableRow, ...styles.hsnTotalRow }}>
                <Text style={{ ...styles.hsnCell, ...styles.hsnColHsn, fontWeight: "bold" }}>TOTAL</Text>
                <Text style={{ ...styles.hsnCell, ...styles.hsnColTaxable, fontWeight: "bold" }}>{grandTaxable.toFixed(2)}</Text>
                <Text style={{ ...styles.hsnCell, ...styles.hsnColRate }} />
                <Text style={{ ...styles.hsnCell, ...styles.hsnColTax, fontWeight: "bold" }}>
                  {(intraState ? round2(grandCgst + grandSgst) : grandIgst).toFixed(2)}
                </Text>
                <Text style={{ ...styles.hsnCell, ...styles.hsnColTotal, fontWeight: "bold", borderRight: "none" }}>{totalInvoiceValue.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.chargesBox}>
            <Text style={styles.boxTitle}>Summary of Charges</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gross Value of Goods</Text>
              <Text style={styles.summaryValue}>{goodsGross.toFixed(2)}</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Less: Discount{order.discount_code ? ` (${order.discount_code})` : ""} ({discountPercent.toFixed(1)}%)
                </Text>
                <Text style={styles.summaryValue}>({couponDiscount.toFixed(2)})</Text>
              </View>
            )}
            {shipping > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Add: Shipping & Handling</Text>
                <Text style={styles.summaryValue}>{shipping.toFixed(2)}</Text>
              </View>
            )}
            {convenienceFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Add: Convenience Fee</Text>
                <Text style={styles.summaryValue}>{convenienceFee.toFixed(2)}</Text>
              </View>
            )}
            {codFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Add: COD Charge</Text>
                <Text style={styles.summaryValue}>{codFee.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryBold}>Total Invoice Value (incl. GST)</Text>
              <Text style={styles.summaryBold}>{totalInvoiceValue.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxable Value</Text>
              <Text style={styles.summaryValue}>{grandTaxable.toFixed(2)}</Text>
            </View>
            {intraState ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>CGST @ 2.5%</Text>
                  <Text style={styles.summaryValue}>{grandCgst.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>SGST @ 2.5%</Text>
                  <Text style={styles.summaryValue}>{grandSgst.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>IGST</Text>
                  <Text style={styles.summaryValue}>Not applicable</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>IGST @ 5%</Text>
                  <Text style={styles.summaryValue}>{grandIgst.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>CGST / SGST</Text>
                  <Text style={styles.summaryValue}>Not applicable</Text>
                </View>
              </>
            )}
            <View style={styles.payableBar}>
              <Text style={styles.payableLabel}>AMOUNT PAYABLE</Text>
              <Text style={styles.payableValue}>{money(amountPayable)}</Text>
            </View>
            <Text style={styles.amountWords}>Amount in Words: {amountInWords(amountPayable)}</Text>
          </View>
        </View>

        <View style={styles.declareRow}>
          <View style={styles.declareCol}>
            <Text style={styles.declareTitle}>Declaration & Notes</Text>
            {declarationNotes.map((note, index) => (
              <Text style={styles.declareNote} key={index}>
                {index + 1}. {note}
              </Text>
            ))}
            <Text style={styles.computerGenerated}>
              This is a computer-generated invoice; no signature is required.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>PURE BY NATURE. ESSENTIAL BY CHOICE</Text>
        </View>
      </Page>
    </Document>
  );
}
