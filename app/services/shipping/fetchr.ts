/**
 * Fetchr delivery integration.
 * Fetchr is a UAE/Saudi Arabia last-mile delivery service
 * using GPS-based delivery instead of traditional addresses.
 * REST API with JSON payloads.
 */

export interface FetchrConfig {
  apiKey: string;
  merchantId: string;
  sandbox: boolean;
}

export interface FetchrAddress {
  name: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface FetchrDelivery {
  orderId: string;
  pickupAddress: FetchrAddress;
  deliveryAddress: FetchrAddress;
  packageDescription: string;
  weight?: number;
  cashOnDelivery?: number;
  currency?: string;
  notes?: string;
  preferredDate?: string;
  preferredSlot?: string;
}

export interface FetchrDeliveryResult {
  trackingId: string;
  estimatedDelivery: string;
}

export interface FetchrTrackingEvent {
  timestamp: Date;
  status: string;
  description: string;
  location?: string;
}

export interface FetchrTrackingResult {
  status: string;
  events: FetchrTrackingEvent[];
}

export interface FetchrCancelResult {
  success: boolean;
}

export interface FetchrDeliverySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface FetchrDeliverySlotDay {
  date: string;
  slots: FetchrDeliverySlot[];
}

const FETCHR_SANDBOX_URL = "https://api-sandbox.fetchr.us/v3";
const FETCHR_PRODUCTION_URL = "https://api.fetchr.us/v3";

function getBaseUrl(sandbox: boolean): string {
  return sandbox ? FETCHR_SANDBOX_URL : FETCHR_PRODUCTION_URL;
}

async function fetchrRequest<T>(
  config: FetchrConfig,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getBaseUrl(config.sandbox);

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "X-Merchant-Id": config.merchantId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Fetchr API error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Create a new delivery order with Fetchr.
 */
export async function createDelivery(
  config: FetchrConfig,
  delivery: FetchrDelivery,
): Promise<FetchrDeliveryResult> {
  const payload = {
    order_reference: delivery.orderId,
    pickup: {
      contact_name: delivery.pickupAddress.name,
      contact_phone: delivery.pickupAddress.phone,
      contact_email: delivery.pickupAddress.email,
      address: {
        line1: delivery.pickupAddress.addressLine1,
        line2: delivery.pickupAddress.addressLine2,
        city: delivery.pickupAddress.city,
        state: delivery.pickupAddress.state,
        country: delivery.pickupAddress.country,
        postal_code: delivery.pickupAddress.postalCode,
        ...(delivery.pickupAddress.latitude != null
          ? {
              latitude: delivery.pickupAddress.latitude,
              longitude: delivery.pickupAddress.longitude,
            }
          : {}),
      },
    },
    delivery: {
      contact_name: delivery.deliveryAddress.name,
      contact_phone: delivery.deliveryAddress.phone,
      contact_email: delivery.deliveryAddress.email,
      address: {
        line1: delivery.deliveryAddress.addressLine1,
        line2: delivery.deliveryAddress.addressLine2,
        city: delivery.deliveryAddress.city,
        state: delivery.deliveryAddress.state,
        country: delivery.deliveryAddress.country,
        postal_code: delivery.deliveryAddress.postalCode,
        ...(delivery.deliveryAddress.latitude != null
          ? {
              latitude: delivery.deliveryAddress.latitude,
              longitude: delivery.deliveryAddress.longitude,
            }
          : {}),
      },
    },
    package: {
      description: delivery.packageDescription,
      weight: delivery.weight ?? 1,
    },
    ...(delivery.cashOnDelivery != null
      ? {
          cash_on_delivery: {
            amount: delivery.cashOnDelivery,
            currency: delivery.currency ?? "AED",
          },
        }
      : {}),
    notes: delivery.notes,
    preferred_date: delivery.preferredDate,
    preferred_slot: delivery.preferredSlot,
  };

  const result = await fetchrRequest<{
    data: {
      tracking_id: string;
      estimated_delivery: string;
      status: string;
    };
  }>(config, "/deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    trackingId: result.data.tracking_id,
    estimatedDelivery: result.data.estimated_delivery,
  };
}

/**
 * Track a delivery by tracking ID.
 */
export async function trackDelivery(
  config: FetchrConfig,
  trackingId: string,
): Promise<FetchrTrackingResult> {
  const result = await fetchrRequest<{
    data: {
      status: string;
      tracking_history: Array<{
        timestamp: string;
        status: string;
        description: string;
        location?: string;
      }>;
    };
  }>(config, `/deliveries/${encodeURIComponent(trackingId)}/tracking`);

  return {
    status: result.data.status,
    events: result.data.tracking_history.map((event) => ({
      timestamp: new Date(event.timestamp),
      status: event.status,
      description: event.description,
      location: event.location,
    })),
  };
}

/**
 * Cancel a delivery by tracking ID.
 */
export async function cancelDelivery(
  config: FetchrConfig,
  trackingId: string,
): Promise<FetchrCancelResult> {
  const result = await fetchrRequest<{
    data: {
      success: boolean;
      message?: string;
    };
  }>(config, `/deliveries/${encodeURIComponent(trackingId)}/cancel`, {
    method: "POST",
  });

  return {
    success: result.data.success,
  };
}

/**
 * Get available delivery time slots for a given city.
 */
export async function getDeliverySlots(
  config: FetchrConfig,
  city: string,
): Promise<FetchrDeliverySlotDay[]> {
  const result = await fetchrRequest<{
    data: {
      available_dates: Array<{
        date: string;
        slots: Array<{
          start_time: string;
          end_time: string;
          available: boolean;
        }>;
      }>;
    };
  }>(config, `/delivery-slots?city=${encodeURIComponent(city)}`);

  return result.data.available_dates.map((day) => ({
    date: day.date,
    slots: day.slots.map((slot) => ({
      startTime: slot.start_time,
      endTime: slot.end_time,
      available: slot.available,
    })),
  }));
}
