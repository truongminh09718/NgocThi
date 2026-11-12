import { corsHeaders, getVnpaySecrets, isValidVnpaySignature, json, supabaseRest } from '../_shared/vnpay.ts'

function ipnResponse(code: string, message: string) {
  return new Response(JSON.stringify({ RspCode: code, Message: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'GET') return ipnResponse('99', 'Method not allowed')
  try {
    const url = new URL(request.url)
    const { tmnCode, hashSecret } = getVnpaySecrets()
    if (!await isValidVnpaySignature(url, hashSecret)) return ipnResponse('97', 'Invalid checksum')
    if (url.searchParams.get('vnp_TmnCode') !== tmnCode) return ipnResponse('97', 'Invalid merchant')

    const txnRef = url.searchParams.get('vnp_TxnRef') ?? ''
    const amount = Number(url.searchParams.get('vnp_Amount'))
    const lookup = await supabaseRest(`payment_orders?select=txn_ref,amount_vnd,status&txn_ref=eq.${encodeURIComponent(txnRef)}`)
    if (!lookup.ok) return ipnResponse('99', 'Order lookup failed')
    const orders = await lookup.json()
    const order = orders[0]
    if (!order) return ipnResponse('01', 'Order not found')
    if (order.status === 'paid') return ipnResponse('02', 'Order already confirmed')
    if (amount !== Number(order.amount_vnd) * 100) return ipnResponse('04', 'Invalid amount')

    const paid = url.searchParams.get('vnp_ResponseCode') === '00' && url.searchParams.get('vnp_TransactionStatus') === '00'
    const update = await supabaseRest(`payment_orders?txn_ref=eq.${encodeURIComponent(txnRef)}&status=eq.pending`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: paid ? 'paid' : 'failed',
        vnp_transaction_no: url.searchParams.get('vnp_TransactionNo'),
        vnp_bank_code: url.searchParams.get('vnp_BankCode'),
        vnp_pay_date: url.searchParams.get('vnp_PayDate'),
        completed_at: paid ? new Date().toISOString() : null,
      }),
    })
    if (!update.ok) return ipnResponse('99', 'Could not update order')
    return ipnResponse('00', 'Confirm Success')
  } catch (error) {
    console.error('vnpay-ipn', error)
    return ipnResponse('99', 'Unknown error')
  }
})
