import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Search, CreditCard, PackageCheck } from 'lucide-react'
import {
  dataApi, STATUS_LABEL, PAYMENT_STATUS, PAYMENT_STATUS_LABEL,
  FULFILMENT_FLOW, FULFILMENT_LABEL,
} from '../../services/db.js'

function money(n) { return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

const PAYMENT_STYLE = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
  paid: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
  failed: 'bg-red-900/40 text-red-300 border-red-700/30',
  refunded: 'bg-plum-800 text-plum-300 border-plum-700/30',
}

const FULFILMENT_STYLE = {
  awaiting_payment: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
  confirmed: 'bg-sky-900/40 text-sky-300 border-sky-700/30',
  in_production: 'bg-amber-900/40 text-amber-300 border-amber-700/30',
  ready_for_collection: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
  out_for_delivery: 'bg-sky-900/40 text-sky-200 border-sky-700/30',
  completed: 'bg-plum-800 text-plum-300 border-plum-700/30',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700/30',
}

// Keep the legacy `status` field in step with fulfilment for older screens.
const FULFILMENT_TO_LEGACY = {
  awaiting_payment: 'pending_payment',
  confirmed: 'new',
  in_production: 'baking',
  ready_for_collection: 'ready',
  out_for_delivery: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
}

function Chip({ label, className }) {
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

function OrderRow({ order, onChanged }) {
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState('')

  const paymentStatus = order.paymentStatus || 'pending'
  const fulfilmentStatus = order.fulfilmentStatus || 'awaiting_payment'

  const setPayment = async (next) => {
    if (next === 'paid' && !window.confirm('Mark this order as paid? Only do this after verifying the payment in Paystack.')) return
    setBusy('payment')
    try {
      await dataApi.updateOrder(order.id, { paymentStatus: next })
      onChanged(order.id, { paymentStatus: next })
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy('')
    }
  }

  const setFulfilment = async (next) => {
    setBusy('fulfilment')
    try {
      await dataApi.updateOrder(order.id, {
        fulfilmentStatus: next,
        status: FULFILMENT_TO_LEGACY[next] || order.status,
      })
      onChanged(order.id, { fulfilmentStatus: next, status: FULFILMENT_TO_LEGACY[next] || order.status })
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-plum-800/50"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <td className="px-5 py-3.5 font-mono text-xs text-plum-300">#{order.id.slice(-6).toUpperCase()}</td>
        <td className="px-5 py-3.5 text-ivory">{order.customerName}</td>
        <td className="hidden px-5 py-3.5 text-plum-300 md:table-cell">{order.customerEmail}</td>
        <td className="hidden px-5 py-3.5 text-plum-300 sm:table-cell">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
        </td>
        <td className="px-5 py-3.5 text-ivory">{money(order.total)}</td>
        <td className="px-5 py-3.5"><Chip label={PAYMENT_STATUS_LABEL[paymentStatus] || paymentStatus} className={PAYMENT_STYLE[paymentStatus] || PAYMENT_STYLE.pending} /></td>
        <td className="px-5 py-3.5"><Chip label={FULFILMENT_LABEL[fulfilmentStatus] || fulfilmentStatus} className={FULFILMENT_STYLE[fulfilmentStatus] || FULFILMENT_STYLE.awaiting_payment} /></td>
        <td className="px-5 py-3.5 text-plum-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-plum-800/30">
          <td colSpan={8} className="px-5 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Items */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-plum-400">Items ordered</p>
                <ul className="space-y-3">
                  {(order.items || []).map((item, i) => (
                    <li key={item.lineId || i} className="rounded-xl bg-plum-900/60 p-3">
                      <div className="flex justify-between text-sm">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-ivory font-medium">{item.name}</span>
                            <span className="text-plum-400">× {item.qty}</span>
                            {item.productType && item.productType !== 'cake' && (
                              <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${
                                item.productType === 'cake-slice' ? 'bg-amber-900/40 text-amber-300' : 'bg-plum-800 text-plum-400'
                              }`}>
                                {item.productType === 'cake-slice' ? 'Slice' : 'Loaf'}
                              </span>
                            )}
                          </div>
                          {item.customisation && (
                            <div className="mt-1.5 space-y-0.5">
                              {item.customisation.size && (
                                <p className="text-xs text-plum-300">Size: {item.customisation.size} {item.customisation.servings ? `(${item.customisation.servings})` : ''}</p>
                              )}
                              {item.customisation.flavour && <p className="text-xs text-plum-300">Sponge: {item.customisation.flavour}</p>}
                              {item.customisation.filling && <p className="text-xs text-plum-300">Filling: {item.customisation.filling}</p>}
                              {item.customisation.covering && <p className="text-xs text-plum-300">Covering: {item.customisation.covering}</p>}
                              {item.customisation.eventType && <p className="text-xs text-plum-300">Occasion: {item.customisation.eventType}</p>}
                              {item.customisation.celebrantGender && <p className="text-xs text-plum-300">Celebrant: {item.customisation.celebrantGender}</p>}
                              {item.customisation.details && <p className="text-xs text-plum-300">More details: {item.customisation.details}</p>}
                            </div>
                          )}
                          <p className="mt-1 text-[0.65rem] text-plum-500">
                            {money(item.unitPrice ?? item.price)} each
                          </p>
                        </div>
                        <span className="shrink-0 text-plum-300 ml-3">{money(item.subtotal ?? (item.unitPrice ?? item.price) * item.qty)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-plum-300"><span>Subtotal</span><span>{money(order.subtotal ?? order.total)}</span></div>
                  <div className="flex justify-between text-plum-300"><span>Delivery</span><span>{money(order.deliveryFee || 0)}</span></div>
                  <div className="flex justify-between font-medium text-ivory"><span>Total</span><span>{money(order.total)}</span></div>
                </div>

                {order.notes && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-plum-400">More details</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-plum-200">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Details + status controls */}
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-plum-400">Contact</p>
                  <p className="text-ivory">{order.customerEmail}</p>
                  {order.customerPhone && <p className="text-plum-300">{order.customerPhone}</p>}
                </div>
                {order.eventDate && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-plum-400">Event date</p>
                    <p className="text-ivory">{order.eventDate}</p>
                  </div>
                )}
                {order.eventType && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-plum-400">Event / occasion</p>
                    <p className="text-ivory">{order.eventType}</p>
                  </div>
                )}
                {order.celebrantGender && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-plum-400">Celebrant's gender</p>
                    <p className="text-ivory">{order.celebrantGender}</p>
                  </div>
                )}
                {order.delivery && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-plum-400">Delivery</p>
                    <p className="text-ivory capitalize">{order.delivery}</p>
                  </div>
                )}
                {order.flavour && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-plum-400">Flavour</p>
                    <p className="text-ivory">{order.flavour}</p>
                  </div>
                )}
                {order.sourceEnquiryId && (
                  <p className="text-xs text-plum-500">Converted from enquiry {order.sourceEnquiryId}</p>
                )}

                {/* Payment status */}
                <div className="pt-3 border-t border-plum-700">
                  <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-plum-400">
                    <CreditCard size={12} /> Payment status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(PAYMENT_STATUS).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy === 'payment' || s === paymentStatus}
                        onClick={(e) => { e.stopPropagation(); setPayment(s) }}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50 ${PAYMENT_STYLE[s] || 'bg-plum-700 text-plum-200'}`}
                      >
                        {PAYMENT_STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[0.65rem] text-plum-500">
                    Online payments are verified by the server. Only mark paid after checking Paystack.
                  </p>
                </div>

                {/* Fulfilment status */}
                <div className="pt-3 border-t border-plum-700">
                  <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-plum-400">
                    <PackageCheck size={12} /> Fulfilment status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FULFILMENT_FLOW.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy === 'fulfilment' || s === fulfilmentStatus}
                        onClick={(e) => { e.stopPropagation(); setFulfilment(s) }}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50 ${FULFILMENT_STYLE[s] || 'bg-plum-700 text-plum-200'}`}
                      >
                        {FULFILMENT_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dataApi.getAllOrders().then(setOrders).catch(() => setOrders([]))
    const unsub = dataApi.subscribe?.(() => {
      dataApi.getAllOrders().then(setOrders).catch(() => {})
    }) || (() => {})
    return () => unsub()
  }, [])

  const updateLocal = (id, patch) => {
    setOrders((prev) => prev ? prev.map((o) => o.id === id ? { ...o, ...patch } : o) : prev)
  }

  const filtered = (orders || []).filter((o) => {
    const fulfilment = o.fulfilmentStatus || 'awaiting_payment'
    const matchStatus = statusFilter === 'all' || fulfilment === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || o.customerName?.toLowerCase().includes(q) || o.customerEmail?.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ivory">Orders</h1>
        <p className="mt-1 text-sm text-plum-400">
          {orders ? `${orders.length} total order${orders.length !== 1 ? 's' : ''}` : 'Loading…'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or ref…"
            className="w-full rounded-full border border-plum-700 bg-plum-800 pl-9 pr-4 py-2 text-sm text-ivory placeholder:text-plum-500 focus:border-plum-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...FULFILMENT_FLOW].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-plum-500 text-ivory' : 'border border-plum-700 text-plum-300 hover:border-plum-500 hover:text-ivory'
              }`}
            >
              {s === 'all' ? 'All' : FULFILMENT_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {orders === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-plum-800 py-16 text-center text-plum-400">No orders match.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-plum-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-800 bg-plum-900">
                {['Ref', 'Customer', 'Email', 'Date', 'Total', 'Payment', 'Fulfilment', ''].map((h) => (
                  <th key={h} className={`px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400 ${!h || h === 'Email' || h === 'Date' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-800 bg-plum-900">
              {filtered.map((o) => (
                <OrderRow key={o.id} order={o} onChanged={updateLocal} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
