import { corsHeaders, json, supabaseRest } from '../_shared/vnpay.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'GET') return json({ error: 'Phương thức không được hỗ trợ.' }, 405)
  try {
    const txnRef = new URL(request.url).searchParams.get('txnRef') ?? ''
    if (!/^\d{14}[a-f0-9]{12}$/.test(txnRef)) return json({ error: 'Mã giao dịch không hợp lệ.' }, 400)
    const response = await supabaseRest(`payment_orders?select=status&txn_ref=eq.${encodeURIComponent(txnRef)}`)
    if (!response.ok) return json({ error: 'Chưa tra được trạng thái thanh toán.' }, 503)
    const rows = await response.json()
    if (!rows.length) return json({ error: 'Không tìm thấy giao dịch.' }, 404)
    return json({ status: rows[0].status })
  } catch (error) {
    console.error('vnpay-payment-status', error)
    return json({ error: 'Không tra được trạng thái giao dịch.' }, 500)
  }
})
