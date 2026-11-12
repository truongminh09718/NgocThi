import { canonicalVnpQuery, corsHeaders, getVnpaySecrets, hmacSha512, json, supabaseRest, vietnamTime } from '../_shared/vnpay.ts'

const catalog: Record<string, { title: string; price: number }> = {
  'giao-trinh-marketing': { title: 'Giao trinh Marketing can ban', price: 50000 },
  'may-tinh-casio': { title: 'May tinh Casio fx-580VN X', price: 280000 },
  'vo-so-tay': { title: 'Bo vo ghi va but gel', price: 45000 },
  'giao-trinh-toan-cao-cap': { title: 'Giao trinh Toan cao cap', price: 60000 },
  'nguyen-ly-ke-toan': { title: 'Giao trinh Nguyen ly ke toan', price: 55000 },
  'dung-cu-ve-ky-thuat': { title: 'Bo dung cu ve ky thuat', price: 75000 },
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Phương thức không được hỗ trợ.' }, 405)
  try {
    if (Deno.env.get('PAYMENT_MODE') !== 'sandbox') return json({ error: 'Chỉ cho phép tạo thanh toán ở chế độ sandbox.' }, 503)
    const body = await request.json().catch(() => ({}))
    const listingId = typeof body.listingId === 'string' ? body.listingId : ''
    const item = catalog[listingId]
    if (!item) return json({ error: 'Sản phẩm này chưa hỗ trợ thanh toán sandbox.' }, 400)

    const { tmnCode, hashSecret } = getVnpaySecrets()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const siteUrl = Deno.env.get('SITE_URL')
    const returnUrl = Deno.env.get('VNP_RETURN_URL')
    if (!siteUrl || !returnUrl) return json({ error: 'Thiếu URL website hoặc URL trả kết quả VNPAY.' }, 503)

    const txnRef = `${vietnamTime()}${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`
    const now = vietnamTime()
    const expires = vietnamTime(new Date(Date.now() + 15 * 60 * 1000))
    const order = await supabaseRest('payment_orders', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ txn_ref: txnRef, listing_id: listingId, listing_title: item.title, amount_vnd: item.price, status: 'pending' }),
    })
    if (!order.ok) return json({ error: 'Không lưu được đơn thanh toán. Hãy thử lại.' }, 503)

    const fields: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(item.price * 100),
      vnp_CurrCode: 'VND',
      vnp_BankCode: 'VNPAYQR',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `StuMarket sandbox ${listingId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
      vnp_CreateDate: now,
      vnp_ExpireDate: expires,
    }
    const hash = await hmacSha512(hashSecret, canonicalVnpQuery(fields))
    const query = new URLSearchParams(fields)
    query.set('vnp_SecureHash', hash)
    const payUrl = Deno.env.get('VNP_PAY_URL') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    if (!payUrl.startsWith('https://sandbox.vnpayment.vn/')) return json({ error: 'URL VNPAY sandbox không hợp lệ.' }, 503)
    return json({ paymentUrl: `${payUrl}?${query.toString()}` })
  } catch (error) {
    console.error('vnpay-create-payment', error)
    return json({ error: error instanceof Error ? error.message : 'Không tạo được yêu cầu thanh toán.' }, 500)
  }
})
