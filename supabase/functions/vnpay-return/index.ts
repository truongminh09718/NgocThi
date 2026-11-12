import { getVnpaySecrets, isValidVnpaySignature, supabaseRest } from '../_shared/vnpay.ts'

Deno.serve(async (request) => {
  const appUrl = Deno.env.get('SITE_URL')
  if (!appUrl) return new Response('Thiếu cấu hình SITE_URL.', { status: 503 })
  const target = new URL('thanh-toan', appUrl.endsWith('/') ? appUrl : `${appUrl}/`)
  try {
    const url = new URL(request.url)
    const { tmnCode, hashSecret } = getVnpaySecrets()
    const valid = await isValidVnpaySignature(url, hashSecret) && url.searchParams.get('vnp_TmnCode') === tmnCode
    const txnRef = url.searchParams.get('vnp_TxnRef') ?? ''
    if (!valid || !txnRef) {
      target.searchParams.set('status', 'invalid')
      return Response.redirect(target, 303)
    }
    const lookup = await supabaseRest(`payment_orders?select=txn_ref&txn_ref=eq.${encodeURIComponent(txnRef)}`)
    if (!lookup.ok || !(await lookup.json()).length) {
      target.searchParams.set('status', 'not-found')
      return Response.redirect(target, 303)
    }
    target.searchParams.set('txnRef', txnRef)
  } catch (error) {
    console.error('vnpay-return', error)
    target.searchParams.set('status', 'error')
  }
  return Response.redirect(target, 303)
})
