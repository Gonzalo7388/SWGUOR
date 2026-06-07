import {
  CULQI_CHARGE_API_DEFAULT,
  CULQI_DEFAULT_CURRENCY,
  type CulqiCurrencyCode,
} from '@/lib/constants/culqi';
import { mapCulqiUserMessage } from '@/lib/helpers/culqi-checkout.helper';

export interface CulqiChargeClientPayload {
  token?: string;
  source_id?: string;
  amount: number;
  currency_code?: CulqiCurrencyCode;
  email: string;
  description?: string;
  [key: string]: unknown;
}

export interface CulqiChargeClientResult {
  success: boolean;
  data?: unknown;
  message?: string;
  code?: string;
}

export async function postCulqiCharge(
  payload: CulqiChargeClientPayload,
  endpoint = CULQI_CHARGE_API_DEFAULT,
): Promise<CulqiChargeClientResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currency_code: CULQI_DEFAULT_CURRENCY,
      ...payload,
    }),
  });

  const json = (await response.json()) as CulqiChargeClientResult;

  if (!response.ok || !json.success) {
    return {
      success: false,
      message: mapCulqiUserMessage(json.message ?? '', json.code),
      code: json.code,
    };
  }

  return json;
}
