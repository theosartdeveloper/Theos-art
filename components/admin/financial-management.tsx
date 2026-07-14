'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Download,
  FileSpreadsheet,
  FileText,
  Headphones,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminSectionHeader } from '@/components/admin/admin-section-header'
import type { FinancialSummary } from '@/lib/admin/data/financial-analytics'
import {
  downloadMoneyTrafficCsv,
  downloadMoneyTrafficExcel,
  downloadMoneyTrafficPdf,
} from '@/lib/admin/data/money-traffic-export'

function formatRwf(value: number) {
  return `${Math.round(value).toLocaleString()} RWF`
}

export default function FinancialManagement() {
  const [data, setData] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/admin/financial?${params.toString()}`, {
        credentials: 'same-origin',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !data) {
    return <p className="text-slate-600 p-6">Loading sales &amp; money traffic…</p>
  }

  if (!data) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-700">{error || 'Could not load financial summary.'}</p>
        <Button onClick={() => void load()}>Retry</Button>
      </div>
    )
  }

  const marginPct =
    data.shopGrossRevenue > 0
      ? Math.round((data.shopNetProfit / data.shopGrossRevenue) * 100)
      : 0

  return (
    <div className="admin-portal-content space-y-6">
      <AdminSectionHeader
        title="Sales & money traffic"
        description="Website revenue, shop profit/loss, stock valuation, and downloadable Excel / PDF reports."
      />

      <Card className="border-slate-200">
        <CardContent className="pt-6 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="date"
              className="mt-1 w-auto"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="date"
              className="mt-1 w-auto"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <Button onClick={() => void load()} className="bg-[var(--brand-navy)] text-white">
            Apply range
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
          >
            All time
          </Button>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => downloadMoneyTrafficExcel(data)}>
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadMoneyTrafficCsv(data)}>
              <Download className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => void downloadMoneyTrafficPdf(data)}>
              <FileText className="h-4 w-4 mr-1.5" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Total website revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-950">{formatRwf(data.totalRevenue)}</p>
            <p className="text-xs text-emerald-800 mt-1">Shop + learning + support (verified)</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Shop gross sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-950">{formatRwf(data.shopGrossRevenue)}</p>
            <p className="text-xs text-indigo-800 mt-1">
              {data.shopOrdersPaid} paid · {data.shopOrdersPending} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Shop net profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-950">{formatRwf(data.shopNetProfit)}</p>
            <p className="text-xs text-amber-800 mt-1">
              COGS {formatRwf(data.shopCogs)} · margin ~{marginPct}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-900 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Cancelled / lost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-950">{formatRwf(data.shopLossAmount)}</p>
            <p className="text-xs text-rose-800 mt-1">{data.shopOrdersCancelled} cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> E-learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatRwf(data.learningRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
              <Headphones className="h-4 w-4" /> Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{formatRwf(data.supportRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
              <Banknote className="h-4 w-4" /> POS / Online shop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-800">
              POS {formatRwf(data.posRevenue)} · Online {formatRwf(data.onlineShopRevenue)}
            </p>
            <Link href="/admin/dashboard/pos">
              <Button size="sm" variant="outline" className="mt-2">
                Open POS <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
              <Warehouse className="h-4 w-4" /> Stock value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-800">
              Cost {formatRwf(data.inventoryValueCost)}
              <br />
              Retail {formatRwf(data.inventoryValueRetail)}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {data.lowStockCount} low · {data.outOfStockCount} out
            </p>
            <Link href="/admin/dashboard/stock">
              <Button size="sm" variant="outline" className="mt-2">
                Manage stock
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5" /> Product sales (P&amp;L)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.productSales.length === 0 ? (
            <p className="text-sm text-slate-600">
              No catalog products or paid line items found for this range.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 pr-3">Units</th>
                    <th className="py-2 pr-3">Revenue</th>
                    <th className="py-2 pr-3">COGS</th>
                    <th className="py-2 pr-3">Profit</th>
                    <th className="py-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productSales.map((p) => (
                    <tr key={p.productId || p.name} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-2 pr-3 text-slate-700">{p.unitsSold}</td>
                      <td className="py-2 pr-3 text-slate-900">{formatRwf(p.revenue)}</td>
                      <td className="py-2 pr-3 text-slate-600">{formatRwf(p.cogs)}</td>
                      <td
                        className={`py-2 pr-3 font-medium ${
                          p.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatRwf(p.profit)}
                      </td>
                      <td className="py-2 text-slate-700">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Recent product orders</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentShopOrders.length === 0 ? (
            <p className="text-sm text-slate-600">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Profit</th>
                    <th className="py-2 pr-4">Payment</th>
                    <th className="py-2">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentShopOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">{order.order_number}</td>
                      <td className="py-2 pr-4 text-slate-700">{order.customer_name}</td>
                      <td className="py-2 pr-4 text-slate-900">{formatRwf(order.total_amount)}</td>
                      <td className="py-2 pr-4 text-slate-700">
                        {order.profit != null ? formatRwf(order.profit) : '—'}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-2 capitalize text-slate-600">{order.channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/admin/dashboard/orders">
              <Button variant="outline" size="sm">
                Manage orders
              </Button>
            </Link>
            <Link href="/admin/dashboard/reports">
              <Button variant="outline" size="sm">
                Platform reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
