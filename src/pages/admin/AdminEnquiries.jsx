import { useEffect, useMemo, useState } from 'react'
import {
  Search, ChevronDown, ChevronUp, Save, Check, X, ShoppingBag, CreditCard,
  ExternalLink, Mail, Phone,
} from 'lucide-react'
import { dataApi } from '../../services/db.js'

function money(n) { return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'converted', label: 'Converted to order' },
]

const STATUS_STYLE = {
  new: 'bg-sky-900/40 text-sky-300 border-sky-700/30',
  reviewing: 'bg-plum-700/60 text-plum-200 border-plum-600/30',
  quoted: 'bg-amber-900/40 text-amber-300 border-amber-700/30',
  accepted: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
  declined: 'bg-red-900/40 text-red-300 border-red-700/30',
  converted: 'bg-plum-800 text-plum-300 border-plum-700/30',
}

function StatusChip({ status }) {
  const label = STATUSES.find((s) => s.value === status)?.label || status
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] || 'bg-plum-800 text-plum-400'}`}>
      {label}
    </span>
  )
}

function EnquiryCard({ enquiry, onChanged }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(enquiry.status || 'new')
  const [notes, setNotes] = useState(enquiry.internalNotes || '')
  const [quotedPrice, setQuotedPrice] = useState(enquiry.quotedPrice ?? '')
  const [quoteNotes, setQuoteNotes] = useState(enquiry.quoteNotes || '')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [paymentUrl, setPaymentUrl] = useState(enquiry.paymentUrl || '')

  const save = async () => {
    setBusy('save')
    setMsg('')
    try {
      const patch = {
        status,
        internalNotes: notes,
        quotedPrice: quotedPrice === '' ? null : Number(quotedPrice),
        quoteNotes,
      }
      await dataApi.updateEnquiry(enquiry.id, patch)
      onChanged?.(enquiry.id, patch)
      setMsg('Saved ✓')
    } catch (e) {
      setMsg(e.message || 'Could not save.')
    } finally {
      setBusy('')
    }
  }

  const setEnquiryStatus = async (next) => {
    setBusy(next)
    setMsg('')
    try {
      await dataApi.updateEnquiry(enquiry.id, { status: next })
      setStatus(next)
      onChanged?.(enquiry.id, { status: next })
      setMsg('Updated ✓')
    } catch (e) {
      setMsg(e.message || 'Could not update status.')
    } finally {
      setBusy('')
    }
  }

  const convertToOrder = async () => {
    const price = Number(quotedPrice)
    if (!Number.isFinite(price) || price <= 0) {
      setMsg('Add a quoted price before converting to an order.')
      return
    }
    if (!window.confirm(`Create an order for ${money(price)} from this enquiry?`)) return
    setBusy('convert')
    setMsg('')
    try {
      const itemName = enquiry.productSlug
        ? `Bespoke ${enquiry.productSlug.replace(/-/g, ' ')}`
        : `Bespoke cake — ${enquiry.occasion || 'celebration'}`
      const order = await dataApi.createOrder({
        uid: 'enquiry',
        customerName: enquiry.name,
        customerEmail: enquiry.email,
        customerPhone: enquiry.whatsapp,
        eventDate: enquiry.eventDate,
        eventType: enquiry.occasion,
        delivery: enquiry.eventLocation ? 'delivery' : 'collection',
        notes: [
          `Converted from cake enquiry ${enquiry.id}.`,
          enquiry.designDirection ? `Design: ${enquiry.designDirection}` : '',
          enquiry.message || '',
        ].filter(Boolean).join('\n'),
        items: [{
          id: `enquiry-${enquiry.id}`,
          productId: `enquiry-${enquiry.id}`,
          lineId: `enquiry-${enquiry.id}`,
          slug: enquiry.productSlug || '',
          name: itemName,
          qty: 1,
          unitPrice: price,
          price,
          subtotal: price,
          productType: 'cake',
          purchaseType: 'quotation',
          custom: true,
          trackStock: false,
          description: enquiry.designDirection || '',
          customisation: {
            size: enquiry.size || '',
            flavour: enquiry.flavour || '',
            eventType: enquiry.occasion || '',
            details: enquiry.designDirection || '',
          },
        }],
        subtotal: price,
        deliveryFee: 0,
        total: price,
        status: 'pending_payment',
        paymentStatus: 'pending',
        fulfilmentStatus: 'awaiting_payment',
        sourceEnquiryId: enquiry.id,
      })
      const patch = { status: 'converted', convertedOrderId: order.id }
      await dataApi.updateEnquiry(enquiry.id, patch)
      setStatus('converted')
      onChanged?.(enquiry.id, patch)
      setMsg(`Order #${order.id.slice(-6).toUpperCase()} created. You can now send a payment request.`)
    } catch (e) {
      setMsg(e.message || 'Could not convert the enquiry.')
    } finally {
      setBusy('')
    }
  }

  const requestPayment = async () => {
    const orderId = enquiry.convertedOrderId
    if (!orderId) {
      setMsg('Convert this enquiry to an order before requesting payment.')
      return
    }
    setBusy('pay')
    setMsg('')
    try {
      const result = await dataApi.requestPayment(orderId)
      if (result.authorizationUrl) {
        setPaymentUrl(result.authorizationUrl)
        await dataApi.updateEnquiry(enquiry.id, { paymentUrl: result.authorizationUrl })
        setMsg('Payment link ready. Share it with the customer.')
      } else {
        setMsg(result.message || 'No payment link was returned.')
      }
    } catch (e) {
      setMsg(e.message || 'Could not create a payment request.')
    } finally {
      setBusy('')
    }
  }

  const created = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="overflow-hidden rounded-2xl border border-plum-800 bg-plum-900">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-plum-800/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-ivory">{enquiry.name}</span>
            <StatusChip status={status} />
            {enquiry.productSlug && (
              <span className="rounded-full bg-plum-800 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-plum-300">
                {enquiry.productSlug.replace(/-/g, ' ')}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-plum-400">
            {enquiry.occasion || 'Enquiry'} · {created}
            {enquiry.eventDate ? ` · event ${enquiry.eventDate}` : ''}
          </p>
        </div>
        {quotedPrice !== '' && Number(quotedPrice) > 0 && (
          <span className="text-sm text-plum-200">{money(Number(quotedPrice))}</span>
        )}
        {expanded ? <ChevronUp size={16} className="text-plum-400" /> : <ChevronDown size={16} className="text-plum-400" />}
      </button>

      {expanded && (
        <div className="border-t border-plum-800 px-5 py-5">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer / enquiry details */}
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-4">
                <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1.5 text-plum-200 hover:text-ivory">
                  <Mail size={13} /> {enquiry.email}
                </a>
                <a href={`https://wa.me/${String(enquiry.whatsapp || '').replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-plum-200 hover:text-ivory">
                  <Phone size={13} /> {enquiry.whatsapp}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Occasion', enquiry.occasion],
                  ['Event date', enquiry.eventDate],
                  ['Location', enquiry.eventLocation],
                  ['Guests', enquiry.guestCount],
                  ['Size', enquiry.size],
                  ['Flavour', enquiry.flavour],
                  ['Budget', enquiry.budget],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[0.65rem] uppercase tracking-wide text-plum-500">{k}</p>
                    <p className="text-plum-200">{v}</p>
                  </div>
                ))}
              </div>

              {enquiry.designDirection && (
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wide text-plum-500">Design direction</p>
                  <p className="mt-0.5 whitespace-pre-line text-plum-200">{enquiry.designDirection}</p>
                </div>
              )}
              {enquiry.message && (
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wide text-plum-500">Additional notes</p>
                  <p className="mt-0.5 whitespace-pre-line text-plum-200">{enquiry.message}</p>
                </div>
              )}
              {Array.isArray(enquiry.referenceImages) && enquiry.referenceImages.length > 0 && (
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wide text-plum-500">Reference images</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {enquiry.referenceImages.map((img, i) => {
                      const src = img.url || img.dataUrl
                      return (
                        <div key={`${img.name || i}-${i}`} className="group relative">
                          {src ? (
                            <a href={src} target="_blank" rel="noopener noreferrer" title={img.name || 'Reference image'}>
                              <img
                                src={src}
                                alt={img.name || `Reference image ${i + 1}`}
                                className="h-20 w-20 rounded-lg object-cover ring-1 ring-plum-700 transition hover:ring-plum-400"
                              />
                            </a>
                          ) : (
                            <span className="inline-block rounded-lg border border-dashed border-plum-700 px-3 py-2 text-xs text-plum-300">
                              {img.name || 'Image'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Admin controls */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-plum-400" htmlFor={`status-${enquiry.id}`}>
                  Enquiry status
                </label>
                <select
                  id={`status-${enquiry.id}`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-plum-400" htmlFor={`price-${enquiry.id}`}>
                    Quoted price (₦)
                  </label>
                  <input
                    id={`price-${enquiry.id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    placeholder="e.g. 180000"
                    className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-plum-400" htmlFor={`quote-notes-${enquiry.id}`}>
                    Quote notes
                  </label>
                  <input
                    id={`quote-notes-${enquiry.id}`}
                    type="text"
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Shared with the customer"
                    className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-plum-400" htmlFor={`notes-${enquiry.id}`}>
                  Internal notes (not shared)
                </label>
                <textarea
                  id={`notes-${enquiry.id}`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy === 'save'}
                  className="flex items-center gap-1.5 rounded-full bg-plum-500 px-4 py-2 text-xs font-medium text-ivory hover:bg-plum-400 disabled:opacity-60"
                >
                  <Save size={13} /> {busy === 'save' ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiryStatus('accepted')}
                  disabled={busy === 'accepted'}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-700 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-900/30 disabled:opacity-60"
                >
                  <Check size={13} /> Accept
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiryStatus('declined')}
                  disabled={busy === 'declined'}
                  className="flex items-center gap-1.5 rounded-full border border-red-700 px-3 py-2 text-xs text-red-300 hover:bg-red-900/30 disabled:opacity-60"
                >
                  <X size={13} /> Decline
                </button>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-plum-800 pt-3">
                <button
                  type="button"
                  onClick={convertToOrder}
                  disabled={busy === 'convert' || status === 'converted'}
                  className="flex items-center gap-1.5 rounded-full bg-plum-700 px-4 py-2 text-xs font-medium text-ivory hover:bg-plum-600 disabled:opacity-50"
                >
                  <ShoppingBag size={13} /> {status === 'converted' ? 'Converted' : busy === 'convert' ? 'Converting…' : 'Convert to order'}
                </button>
                <button
                  type="button"
                  onClick={requestPayment}
                  disabled={busy === 'pay' || !enquiry.convertedOrderId}
                  className="flex items-center gap-1.5 rounded-full border border-plum-600 px-4 py-2 text-xs text-plum-200 hover:bg-plum-800 disabled:opacity-50"
                >
                  <CreditCard size={13} /> {busy === 'pay' ? 'Creating…' : 'Payment request'}
                </button>
              </div>

              {enquiry.convertedOrderId && (
                <p className="text-xs text-plum-400">
                  Order ref: <span className="font-mono text-plum-200">#{enquiry.convertedOrderId.slice(-8).toUpperCase()}</span>
                </p>
              )}
              {paymentUrl && (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200"
                >
                  <ExternalLink size={12} /> Open payment link
                </a>
              )}
              {msg && <p className="text-xs text-plum-300">{msg}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = () => dataApi.getEnquiries().then(setEnquiries).catch(() => setEnquiries([]))

  useEffect(() => {
    load()
    const unsub = dataApi.subscribe?.(load) || (() => {})
    return () => unsub()
  }, [])

  const updateLocal = (id, patch) => {
    setEnquiries((prev) => prev ? prev.map((e) => e.id === id ? { ...e, ...patch } : e) : prev)
  }

  const filtered = useMemo(() => (enquiries || []).filter((e) => {
    const matchStatus = statusFilter === 'all' || (e.status || 'new') === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q
      || e.name?.toLowerCase().includes(q)
      || e.email?.toLowerCase().includes(q)
      || e.whatsapp?.toLowerCase().includes(q)
      || e.id?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  }), [enquiries, statusFilter, search])

  const counts = useMemo(() => (enquiries || []).reduce((acc, e) => {
    const s = e.status || 'new'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {}), [enquiries])

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ivory">Cake enquiries</h1>
        <p className="mt-1 text-sm text-plum-400">
          {enquiries
            ? `${enquiries.length} total · ${counts.new || 0} new · ${counts.quoted || 0} quoted · ${counts.converted || 0} converted`
            : 'Loading…'}
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full rounded-full border border-plum-700 bg-plum-800 pl-9 pr-4 py-2 text-sm text-ivory placeholder:text-plum-500 focus:border-plum-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ value: 'all', label: 'All' }, ...STATUSES].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s.value ? 'bg-plum-500 text-ivory' : 'border border-plum-700 text-plum-300 hover:border-plum-500 hover:text-ivory'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {enquiries === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-plum-800 py-16 text-center text-plum-400">
          {enquiries.length === 0 ? 'No enquiries yet. New cake enquiries will appear here.' : 'No enquiries match.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <EnquiryCard key={e.id} enquiry={e} onChanged={updateLocal} />
          ))}
        </div>
      )}
    </div>
  )
}
