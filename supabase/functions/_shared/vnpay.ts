export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_ORIGIN') ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export function getVnpaySecrets() {
  const tmnCode = Deno.env.get('VNP_TMN_CODE')
  const hashSecret = Deno.env.get('VNP_HASH_SECRET')
  if (!tmnCode || !hashSecret) throw new Error('Thiếu cấu hình VNPAY Sandbox trên Supabase.')
  return { tmnCode, hashSecret }
}

function encodeVnpValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+')
}

export function canonicalVnpQuery(values: Record<string, string>) {
  return Object.keys(values).sort().map((key) => `${encodeVnpValue(key)}=${encodeVnpValue(values[key])}`).join('&')
}

export async function hmacSha512(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function vietnamTime(date = new Date()) {
  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return local.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
}

export function vnpayFields(url: URL) {
  const values: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') values[key] = value
  }
  return values
}

export async function isValidVnpaySignature(url: URL, secret: string) {
  const expected = await hmacSha512(secret, canonicalVnpQuery(vnpayFields(url)))
  const provided = url.searchParams.get('vnp_SecureHash')?.toLowerCase() ?? ''
  if (!/^[a-f0-9]{128}$/.test(provided)) return false
  let mismatch = 0
  for (let index = 0; index < expected.length; index++) mismatch |= expected.charCodeAt(index) ^ provided.charCodeAt(index)
  return mismatch === 0
}

export function supabaseRest(path: string, init: RequestInit = {}) {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) throw new Error('Thiếu cấu hình Supabase trên Edge Function.')
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

