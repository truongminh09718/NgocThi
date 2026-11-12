const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export function isVnpayConfigured() {
  return Boolean(supabaseUrl && supabaseKey)
}

async function invoke<T>(functionName: string, options: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !supabaseKey) throw new Error('Thanh toán trực tuyến chưa được cấu hình cho website.')
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      'content-type': 'application/json',
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(result.error || 'Không thể kết nối cổng thanh toán.')
  return result as T
}

export function createVnpaySandboxPayment(listingId: string) {
  return invoke<{ paymentUrl: string }>('vnpay-create-payment', {
    method: 'POST',
    body: JSON.stringify({ listingId }),
  })
}

export function getVnpayPaymentStatus(txnRef: string) {
  return invoke<{ status: 'pending' | 'paid' | 'failed' | 'expired' }>(
    `vnpay-payment-status?txnRef=${encodeURIComponent(txnRef)}`,
    { method: 'GET' },
  )
}
