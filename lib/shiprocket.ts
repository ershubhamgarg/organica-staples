import type { Address } from "@/store/addressStore";
import type { CartItem } from "@/store/cartStore";
import type { Order } from "@/store/orderStore";
import { isLocalDeliveryPincode } from "@/lib/shipping";

const SHIPROCKET_API_BASE = "https://apiv2.shiprocket.in/v1/external";

type ShiprocketAuthResponse = {
  token?: string;
  message?: string;
};

type ShiprocketCreateOrderResponse = {
  order_id?: number | string;
  shipment_id?: number | string;
  status?: string;
  status_code?: number;
  message?: string;
  awb_code?: string;
  courier_name?: string;
};

type ShiprocketAssignAwbResponse = {
  response?: {
    data?: {
      awb_code?: string;
      courier_name?: string;
      routing_code?: string;
    };
  };
  awb_code?: string;
  courier_name?: string;
  message?: string;
};

type ShiprocketTrackActivity = {
  date?: string;
  status?: string;
  activity?: string;
  location?: string;
  "sr-status-label"?: string;
};

export type ShiprocketTrackingDetails = {
  awbCode: string | null;
  courierName: string | null;
  currentStatus: string | null;
  deliveredAt: string | null;
  expectedDeliveryDate: string | null;
  trackingUrl: string | null;
  activities: {
    date: string | null;
    status: string;
    location: string | null;
  }[];
};

type ShiprocketTrackResponse = {
  tracking_data?: {
    track_status?: number;
    error?: string;
    shipment_track?: Array<{
      awb_code?: string;
      courier_name?: string;
      current_status?: string;
      delivered_date?: string;
      etd?: string;
    }>;
    shipment_track_activities?: ShiprocketTrackActivity[];
    track_url?: string;
  };
};

type ShiprocketCourierCompany = {
  courier_company_id?: number;
  courier_name?: string;
  etd?: string;
  freight_charge?: number;
  cod_charges?: number;
  rate?: number;
  rating?: number;
};

type ShiprocketServiceabilityResponse = {
  status?: number;
  data?: {
    recommended_courier_company_id?: number;
    shiprocket_recommended_courier_id?: number;
    available_courier_companies?: ShiprocketCourierCompany[];
  };
  message?: string;
};

export type ShiprocketShipmentResult = {
  orderId: string | null;
  shipmentId: string | null;
  awbCode: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  status:
    | "created"
    | "awb_assigned"
    | "failed"
    | "not_configured"
    | "local_delivery";
  error: string | null;
};

// Shared status mapping used by both the customer-triggered polling route
// and the Shiprocket webhook, so a given Shiprocket status string always
// resolves to the same shipping_status here regardless of which path caught it.
export function normalizeTrackingStatus(status: string | null | undefined) {
  const value = status?.toLowerCase() ?? "";

  if (value.includes("deliver")) return "delivered";
  if (value.includes("out for delivery")) return "out_for_delivery";
  if (value.includes("transit") || value.includes("shipped")) return "in_transit";
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("pick") || value.includes("manifest")) return "awb_assigned";

  return "awb_assigned";
}

export type ShiprocketRateEstimate = {
  available: boolean;
  shippingAmount: number;
  courierName: string | null;
  courierCompanyId: number | null;
  expectedDeliveryDate: string | null;
  codCharges: number;
  freightCharge: number;
  chargeableWeightKg: number;
  error: string | null;
};

const getConfig = () => {
  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();

  if (!email || !password || !pickupLocation) {
    return null;
  }

  return {
    email,
    password,
    pickupLocation,
    pickupPostcode: process.env.SHIPROCKET_PICKUP_POSTCODE?.trim() ?? "125055",
    channelId: Number.parseInt(process.env.SHIPROCKET_CHANNEL_ID ?? "", 10),
    autoAssignAwb: process.env.SHIPROCKET_AUTO_ASSIGN_AWB === "true",
    defaultLengthCm: Number.parseFloat(
      process.env.SHIPROCKET_DEFAULT_LENGTH_CM ?? "20",
    ),
    defaultBreadthCm: Number.parseFloat(
      process.env.SHIPROCKET_DEFAULT_BREADTH_CM ?? "15",
    ),
    defaultHeightCm: Number.parseFloat(
      process.env.SHIPROCKET_DEFAULT_HEIGHT_CM ?? "8",
    ),
    defaultWeightKg: Number.parseFloat(
      process.env.SHIPROCKET_DEFAULT_WEIGHT_KG ?? "0.5",
    ),
  };
};

const maskValue = (value: string | undefined) => {
  if (!value) return null;
  if (value.length <= 5) return "***";

  return `${value.slice(0, 3)}***${value.slice(-2)}`;
};

const shiprocketFetch = async <T>(
  path: string,
  init: RequestInit,
): Promise<T> => {
  const response = await fetch(`${SHIPROCKET_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      body.message ??
        body.error ??
        `Shiprocket request failed (${response.status}).`,
    );
  }

  return body;
};

const getToken = async () => {
  const config = getConfig();

  if (!config) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  const result = await shiprocketFetch<ShiprocketAuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: config.email,
      password: config.password,
    }),
  });

  if (!result.token) {
    throw new Error(
      result.message ?? "Shiprocket did not return an auth token.",
    );
  }

  return result.token;
};

export async function getShiprocketHealth() {
  const config = getConfig();

  if (!config) {
    return {
      configured: false,
      authOk: false,
      status: null,
      message: "Shiprocket credentials are not configured.",
      email: maskValue(process.env.SHIPROCKET_EMAIL),
      emailLength: process.env.SHIPROCKET_EMAIL?.length ?? 0,
      trimmedEmailLength: process.env.SHIPROCKET_EMAIL?.trim().length ?? 0,
      passwordPresent: Boolean(process.env.SHIPROCKET_PASSWORD),
      passwordLength: process.env.SHIPROCKET_PASSWORD?.length ?? 0,
      trimmedPasswordLength:
        process.env.SHIPROCKET_PASSWORD?.trim().length ?? 0,
      pickupLocation: maskValue(process.env.SHIPROCKET_PICKUP_LOCATION),
    };
  }

  try {
    const result = await shiprocketFetch<ShiprocketAuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: config.email,
          password: config.password,
        }),
      },
    );

    return {
      configured: true,
      authOk: Boolean(result.token),
      status: 200,
      message: result.token ? null : (result.message ?? "No token returned."),
      email: maskValue(config.email),
      emailLength: process.env.SHIPROCKET_EMAIL?.length ?? 0,
      trimmedEmailLength: config.email.length,
      passwordPresent: true,
      passwordLength: process.env.SHIPROCKET_PASSWORD?.length ?? 0,
      trimmedPasswordLength: config.password.length,
      pickupLocation: maskValue(config.pickupLocation),
    };
  } catch (error) {
    return {
      configured: true,
      authOk: false,
      status: null,
      message:
        error instanceof Error
          ? error.message
          : "Shiprocket auth check failed.",
      email: maskValue(config.email),
      emailLength: process.env.SHIPROCKET_EMAIL?.length ?? 0,
      trimmedEmailLength: config.email.length,
      passwordPresent: true,
      passwordLength: process.env.SHIPROCKET_PASSWORD?.length ?? 0,
      trimmedPasswordLength: config.password.length,
      pickupLocation: maskValue(config.pickupLocation),
    };
  }
}

const toNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const cleanPhone = (phone: string) => phone.replace(/\D/g, "").slice(-10);

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? "Customer";
  return {
    firstName,
    lastName: parts.join(" "),
  };
};

const parseWeightKg = (weight: string) => {
  const normalized = weight.toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);

  if (!match) return 0;

  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return 0;

  if (normalized.includes("kg") || normalized.includes("litre")) {
    return value;
  }

  if (normalized.includes("ml")) {
    return value / 1000;
  }

  return value / 1000;
};

const getPackageWeightKg = (items: CartItem[], fallbackWeightKg: number) => {
  const total = items.reduce(
    (sum, item) => sum + parseWeightKg(item.weight) * item.quantity,
    0,
  );

  return Math.max(Number(total.toFixed(2)), fallbackWeightKg);
};

const getRecommendedCourier = (
  couriers: ShiprocketCourierCompany[],
  recommendedCourierId: number | undefined,
) =>
  couriers.find(
    (courier) => courier.courier_company_id === recommendedCourierId,
  ) ?? couriers[0];

const getCourierRate = (courier: ShiprocketCourierCompany) => {
  const freightCharge = Number(courier.freight_charge);

  return Number.isFinite(freightCharge) ? freightCharge : 0;
};

const getPaymentMethod = (paymentMethod: string) =>
  paymentMethod === "cod" ? "COD" : "Prepaid";

const getCodAmount = (order: Order) =>
  order.payment_method === "cod" ? toNumber(order.total_amount) : 0;

const buildCreateOrderPayload = (order: Order) => {
  const config = getConfig();

  if (!config) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  const address = order.delivery_address as Address;
  const { firstName, lastName } = splitName(address.name);
  const channelId = Number.isFinite(config.channelId)
    ? { channel_id: config.channelId }
    : {};

  return {
    order_id: order.id,
    order_date: new Date(order.created_at)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    pickup_location: config.pickupLocation,
    ...channelId,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: address.address,
    billing_city: address.city,
    billing_pincode: address.zipCode,
    billing_state: address.state,
    billing_country: "India",
    billing_email: address.email ?? "",
    billing_phone: cleanPhone(address.phone),
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.id,
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
    })),
    payment_method: getPaymentMethod(order.payment_method),
    sub_total: toNumber(order.total_amount),
    length: config.defaultLengthCm,
    breadth: config.defaultBreadthCm,
    height: config.defaultHeightCm,
    weight: getPackageWeightKg(order.items, config.defaultWeightKg),
    cod_amount: getCodAmount(order),
  };
};

const getTrackingUrl = (awbCode: string | null) =>
  awbCode
    ? `https://www.shiprocket.in/shipment-tracking/?awb=${awbCode}`
    : null;

export const isShiprocketConfigured = () => Boolean(getConfig());

export async function estimateShiprocketRate({
  deliveryPostcode,
  items,
  isCod,
  declaredValue,
}: {
  deliveryPostcode: string;
  items: CartItem[];
  isCod: boolean;
  declaredValue: number;
}): Promise<ShiprocketRateEstimate> {
  if (isLocalDeliveryPincode(deliveryPostcode)) {
    return {
      available: true,
      shippingAmount: 0,
      courierName: null,
      courierCompanyId: null,
      expectedDeliveryDate: null,
      codCharges: 0,
      freightCharge: 0,
      chargeableWeightKg: 0,
      error: null,
    };
  }

  const config = getConfig();

  if (!config || !config.pickupPostcode) {
    return {
      available: false,
      shippingAmount: 0,
      courierName: null,
      courierCompanyId: null,
      expectedDeliveryDate: null,
      codCharges: 0,
      freightCharge: 0,
      chargeableWeightKg: 0,
      error: "Shiprocket pickup postcode is not configured.",
    };
  }

  const token = await getToken();
  const weight = getPackageWeightKg(items, config.defaultWeightKg);
  const params = new URLSearchParams({
    pickup_postcode: config.pickupPostcode,
    delivery_postcode: deliveryPostcode,
    cod: isCod ? "1" : "0",
    weight: String(weight),
    length: String(config.defaultLengthCm),
    breadth: String(config.defaultBreadthCm),
    height: String(config.defaultHeightCm),
    declared_value: String(Math.max(Math.round(declaredValue), 1)),
    is_return: "0",
  });

  const result = await shiprocketFetch<ShiprocketServiceabilityResponse>(
    `/courier/serviceability/?${params.toString()}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const couriers = result.data?.available_courier_companies ?? [];
  const recommendedCourierId =
    result.data?.shiprocket_recommended_courier_id ??
    result.data?.recommended_courier_company_id;
  const courier = getRecommendedCourier(couriers, recommendedCourierId);

  if (!courier) {
    return {
      available: false,
      shippingAmount: 0,
      courierName: null,
      courierCompanyId: null,
      expectedDeliveryDate: null,
      codCharges: 0,
      freightCharge: 0,
      chargeableWeightKg: weight,
      error: result.message ?? "No Shiprocket courier is serviceable here.",
    };
  }

  const shippingAmount = getCourierRate(courier);
  const codCharges = Number(courier.cod_charges);
  const freightCharge = Number(courier.freight_charge);

  return {
    available: true,
    shippingAmount: Number(shippingAmount.toFixed(2)),
    courierName: courier.courier_name ?? null,
    courierCompanyId: courier.courier_company_id ?? null,
    expectedDeliveryDate: courier.etd ?? null,
    codCharges: Number.isFinite(codCharges) ? codCharges : 0,
    freightCharge: Number.isFinite(freightCharge) ? freightCharge : 0,
    chargeableWeightKg: weight,
    error: null,
  };
}

export async function createShiprocketShipment(
  order: Order,
): Promise<ShiprocketShipmentResult> {
  const deliveryAddress = order.delivery_address as Address;

  if (isLocalDeliveryPincode(deliveryAddress?.zipCode)) {
    return {
      orderId: null,
      shipmentId: null,
      awbCode: null,
      courierName: null,
      trackingUrl: null,
      status: "local_delivery",
      error: null,
    };
  }

  const config = getConfig();

  if (!config) {
    return {
      orderId: null,
      shipmentId: null,
      awbCode: null,
      courierName: null,
      trackingUrl: null,
      status: "not_configured",
      error: "Shiprocket credentials are not configured.",
    };
  }

  try {
    const token = await getToken();
    const created = await shiprocketFetch<ShiprocketCreateOrderResponse>(
      "/orders/create/adhoc",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildCreateOrderPayload(order)),
      },
    );

    // Shiprocket returns HTTP 200 with a validation-style `message` (e.g. a
    // wrong pickup location) instead of an HTTP error when it rejects the
    // order, so a missing shipment_id has to be treated as a failure here.
    if (!created.shipment_id) {
      throw new Error(
        created.message ?? "Shiprocket did not return a shipment id.",
      );
    }

    const shipmentId = String(created.shipment_id);
    let awbCode = created.awb_code ?? null;
    let courierName = created.courier_name ?? null;
    let status: ShiprocketShipmentResult["status"] = "created";

    if (config.autoAssignAwb && shipmentId) {
      const assigned = await shiprocketFetch<ShiprocketAssignAwbResponse>(
        "/courier/assign/awb",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ shipment_id: shipmentId }),
        },
      );
      awbCode =
        assigned.response?.data?.awb_code ?? assigned.awb_code ?? awbCode;
      courierName =
        assigned.response?.data?.courier_name ??
        assigned.courier_name ??
        courierName;
      status = awbCode ? "awb_assigned" : "created";
    }

    return {
      orderId: created.order_id ? String(created.order_id) : null,
      shipmentId,
      awbCode,
      courierName,
      trackingUrl: getTrackingUrl(awbCode),
      status,
      error: null,
    };
  } catch (error) {
    return {
      orderId: null,
      shipmentId: null,
      awbCode: null,
      courierName: null,
      trackingUrl: null,
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Shiprocket shipment creation failed.",
    };
  }
}

export async function getShiprocketTracking(
  awbCode: string,
): Promise<ShiprocketTrackingDetails> {
  const token = await getToken();
  const result = await shiprocketFetch<ShiprocketTrackResponse>(
    `/courier/track/awb/${encodeURIComponent(awbCode)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const trackingData = result.tracking_data;
  const shipment = trackingData?.shipment_track?.[0];

  // A cancelled AWB isn't reported as a normal status — Shiprocket returns
  // it as `tracking_data.error` (e.g. "Ohh! This AWB has been cancelled.")
  // with an otherwise-empty shipment_track row. That's a real status, not a
  // failure, so it must not be thrown away — only genuine errors should be.
  if (trackingData?.error) {
    if (trackingData.error.toLowerCase().includes("cancel")) {
      return {
        awbCode: shipment?.awb_code || awbCode,
        courierName: shipment?.courier_name || null,
        currentStatus: "CANCELLED",
        deliveredAt: null,
        expectedDeliveryDate: null,
        trackingUrl: trackingData?.track_url || getTrackingUrl(awbCode),
        activities: [],
      };
    }
    throw new Error(trackingData.error);
  }

  return {
    awbCode: shipment?.awb_code ?? awbCode,
    courierName: shipment?.courier_name ?? null,
    currentStatus: shipment?.current_status ?? null,
    deliveredAt: shipment?.delivered_date ?? null,
    expectedDeliveryDate: shipment?.etd ?? null,
    trackingUrl: trackingData?.track_url ?? getTrackingUrl(awbCode),
    activities:
      trackingData?.shipment_track_activities?.map((activity) => ({
        date: activity.date ?? null,
        status:
          activity["sr-status-label"] ??
          activity.activity ??
          activity.status ??
          "Shipment update",
        location: activity.location ?? null,
      })) ?? [],
  };
}
