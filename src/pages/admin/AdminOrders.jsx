import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { dataApi, STATUS_FLOW, STATUS_LABEL } from '../../services/db.js'

function money(n) { return `£${Number(n).toFixed(2)}` }

const STATUS_COLORS = {
  new: 'bg-sky-900/40 text-sky-300 border-sky-700/30',
  confirmed: 'bg-plum-700/60 text-plum-200 border-plum-600/30',
  baking: 'bg-amber-900/40 text-amber-300 border-amber-700/30',
  ready: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
  completed: 'bg-plum-800 text-plum-400 border-plum-700/30',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700/30',
}

function StatusChip({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || 'bg-plum-800 text-plum-400'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)

  const advance = async (newStatus) => {
    setBusy(true)
    try {
      await dataApi.updateOrderStatus(order.id, newStatus)
      onStatusChange(order.id, newStatus)
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]

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
          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td className="px-5 py-3.5 text-ivory">{money(order.total)}</td>
        <td className="px-5 py-3.5"><StatusChip status={order.status} /></td>
        <td className="px-5 py-3.5 text-plum-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-plum-800/30">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Items */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-plum-400">Items ordered</p>
                <ul className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-ivory">{item.name} × {item.qty}</span>
                      <span className="text-plum-300">{money(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-plum-400">Notes</p>
                    <p className="mt-1 text-sm text-plum-200">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Details + status action */}
              <div className="space-y-3 text-sm">
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

                {/* Status progression */}
                <div className="pt-3 border-t border-plum-700">
                  <p className="mb-3 text-xs uppercase tracking-wide text-plum-400">Update status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.filter((s) => s !== order.status).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy}
                        onClick={(e) => { e.stopPropagation(); advance(s) }}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50 ${STATUS_COLORS[s] || 'bg-plum-700 text-plum-200'}`}
                      >
                        → {STATUS_LABEL[s]}
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

  const updateLocal = (id, status) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  const filtered = (orders || []).filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
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
          {['all', ...STATUS_FLOW].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-plum-500 text-ivory' : 'border border-plum-700 text-plum-300 hover:border-plum-500 hover:text-ivory'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
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
                {['Ref', 'Customer', 'Email', 'Date', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className={`px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400 ${!h || h === 'Email' || h === 'Date' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-800 bg-plum-900">
              {filtered.map((o) => (
                <OrderRow key={o.id} order={o} onStatusChange={updateLocal} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
