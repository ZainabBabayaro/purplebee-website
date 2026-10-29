import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { dataApi, STATUS_LABEL } from '../../services/db.js'

function money(n) { return `£${Number(n).toFixed(2)}` }

function statusPill(s) {
  const map = {
    new: 'bg-sky-900/40 text-sky-300',
    confirmed: 'bg-plum-700/60 text-plum-200',
    baking: 'bg-amber-900/40 text-amber-300',
    ready: 'bg-emerald-900/40 text-emerald-300',
    completed: 'bg-plum-800 text-plum-400',
    cancelled: 'bg-red-900/40 text-red-300',
  }
  return map[s] || 'bg-plum-800 text-plum-400'
}

function StatCard({ label, value, Icon, sub }) {
  return (
    <div className="rounded-2xl bg-plum-800 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-plum-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-medium text-ivory">{value}</p>
          {sub && <p className="mt-1 text-xs text-plum-300">{sub}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum-700">
          <Icon size={20} strokeWidth={1.6} className="text-plum-200" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState(null)
  const [inventory, setInventory] = useState(null)

  useEffect(() => {
    dataApi.getAllOrders().then(setOrders).catch(() => setOrders([]))
    dataApi.getInventory().then(setInventory).catch(() => setInventory([]))
  }, [])

  const newOrders = orders?.filter((o) => o.status === 'new') || []
  const revenue = orders?.reduce((n, o) => o.status !== 'cancelled' ? n + (o.total || 0) : n, 0) || 0
  const lowStock = inventory?.filter((p) => p.stock <= 3 && p.active) || []

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ivory">Dashboard</h1>
        <p className="mt-1 text-sm text-plum-400">Overview of orders and inventory.</p>
      </div>

      {/* Stats */}
      {orders === null ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total orders" value={orders.length} Icon={ShoppingBag} />
            <StatCard label="New orders" value={newOrders.length} Icon={Clock} sub={newOrders.length > 0 ? 'Awaiting confirmation' : 'All clear'} />
            <StatCard label="Revenue" value={money(revenue)} Icon={TrendingUp} sub="Excluding cancelled" />
            <StatCard label="Low stock" value={lowStock.length} Icon={Package} sub={lowStock.length ? lowStock.map((p) => p.name).join(', ') : 'No items low'} />
          </div>

          {/* Recent orders */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-ivory">Recent orders</h2>
              <Link to="/admin/orders" className="flex items-center gap-1 text-sm text-plum-400 hover:text-ivory">
                View all <ChevronRight size={15} />
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="rounded-2xl bg-plum-800 px-6 py-10 text-center text-plum-400">No orders yet.</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-plum-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-plum-800 bg-plum-900">
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400">Ref</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400">Customer</th>
                      <th className="hidden px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400 md:table-cell">Date</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400">Total</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-plum-800 bg-plum-900">
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} className="hover:bg-plum-800/60">
                        <td className="px-5 py-3 font-mono text-xs text-plum-300">#{o.id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-3 text-ivory">{o.customerName}</td>
                        <td className="hidden px-5 py-3 text-plum-300 md:table-cell">
                          {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-5 py-3 text-ivory">{money(o.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPill(o.status)}`}>
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
