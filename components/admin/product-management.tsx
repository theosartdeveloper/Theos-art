'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import {
  formatProductStockLabel,
  formatProductUnitLabel,
  PRODUCT_SALE_UNITS,
  type ProductSaleUnit,
} from '@/lib/platform/products'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'

type Category = {
  id: string
  name: string
  slug: string
  type: string
}

type Product = {
  id: string
  name: string
  description?: string
  price: number
  cost_price?: number
  stock: number
  sku?: string
  status: string
  category_id?: string | null
  category?: Category | null
  images?: string[]
  sale_unit?: ProductSaleUnit
  pack_quantity?: number
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  costPrice: '',
  stock: '0',
  sku: '',
  categoryId: '',
  status: 'published',
  imageUrl: '',
  saleUnit: 'piece' as ProductSaleUnit,
  packQuantity: '1',
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const shopCategories = useMemo(
    () => categories.filter((c) => c.type === 'shop'),
    [categories]
  )

  const load = async () => {
    setError('')
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?status=all'),
        fetch('/api/categories?type=shop'),
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      if (!productsRes.ok) {
        throw new Error(productsData.error || 'Failed to load products')
      }
      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (err) {
      setProducts([])
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products
    if (categoryFilter === 'uncategorized') {
      return products.filter((p) => !p.category_id)
    }
    return products.filter((p) => p.category_id === categoryFilter)
  }, [products, categoryFilter])

  const toPayload = (values: typeof emptyForm) => ({
    name: values.name,
    description: values.description,
    price: Number(values.price),
    cost_price: Number(values.costPrice) || 0,
    stock: Number(values.stock),
    sku: values.sku,
    category_id: values.categoryId,
    status: values.status,
    images: values.imageUrl ? [values.imageUrl] : [],
    sale_unit: values.saleUnit,
    pack_quantity: Math.max(1, Number(values.packQuantity) || 1),
  })

  const handleCreate = async () => {
    if (!form.categoryId) {
      setError('Please select a category for this product.')
      return
    }
    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(form)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')

      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      costPrice: String(product.cost_price ?? 0),
      stock: String(product.stock ?? 0),
      sku: product.sku || '',
      categoryId: product.category_id || product.category?.id || '',
      status: product.status || 'published',
      imageUrl: product.images?.[0] || '',
      saleUnit: product.sale_unit || 'piece',
      packQuantity: String(product.pack_quantity ?? 1),
    })
  }

  const handleUpdate = async () => {
    if (!editing) return
    if (!editForm.categoryId) {
      setError('Please select a category for this product.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(editForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      setEditing(null)
      setError('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? Products with order history will be archived instead.')) return
    setError('')
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      if (data.archived) {
        alert(data.message || 'Product archived — it no longer appears in the shop.')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">
            Manage the shop catalogue. Published items appear on the public Shop page.
          </p>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {shopCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {shopCategories.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">
            No product categories yet. Create categories under Admin → Categories (type: shop) before
            adding products.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add product</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Category *</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {shopCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Product name</Label>
            <Input
              className="mt-1"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>SKU</Label>
            <Input
              className="mt-1"
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <Label>Sold as</Label>
            <Select
              value={form.saleUnit}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  saleUnit: v as ProductSaleUnit,
                  packQuantity: v === 'piece' ? '1' : form.packQuantity === '1' ? '6' : form.packQuantity,
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_SALE_UNITS.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {PRODUCT_SALE_UNITS.find((u) => u.id === form.saleUnit)?.hint}
            </p>
          </div>
          <div>
            <Label>Pieces per pack / set</Label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              disabled={form.saleUnit === 'piece'}
              value={form.packQuantity}
              onChange={(e) => setForm({ ...form, packQuantity: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">
              {form.saleUnit === 'piece'
                ? 'Single items use 1 piece.'
                : 'How many individual pieces are in one pack or set.'}
            </p>
          </div>
          <div>
            <Label>Price (RWF)</Label>
            <Input
              className="mt-1"
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label>Cost price (RWF)</Label>
            <Input
              className="mt-1"
              placeholder="Wholesale / COGS"
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            />
          </div>
          <div>
            <Label>
              Stock ({form.saleUnit === 'pack' ? 'packs' : form.saleUnit === 'set' ? 'sets' : 'pieces'})
            </Label>
            <Input
              className="mt-1"
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              className="mt-1"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Product image"
              folder="products"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
          </div>
          {error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}
          <Button
            onClick={handleCreate}
            disabled={saving || !form.categoryId || shopCategories.length === 0}
            className="md:col-span-2 bg-[var(--brand-navy)]"
          >
            Create product
          </Button>
        </CardContent>
      </Card>

      {loading ? <p className="text-slate-600">Loading products…</p> : null}

      {!loading && filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-slate-600">
            No products in this list yet. Create one above — published items also appear in the shop.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const saleUnit = p.sale_unit || 'piece'
          const packQty = p.pack_quantity || 1
          return (
            <Card key={p.id}>
              {p.images?.[0] ? (
                <div className="relative h-40 w-full border-b">
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="h-40 bg-muted flex items-center justify-center text-sm text-slate-600 border-b">
                  No image
                </div>
              )}
              <CardHeader className="pb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {p.category?.name ?? 'Uncategorized'}
                </p>
                <CardTitle className="text-base">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 line-clamp-2">{p.description}</p>
                <p className="text-sm text-slate-800">
                  {p.price?.toLocaleString()} RWF · {formatProductUnitLabel(saleUnit, packQty)}
                </p>
                <p className="text-xs text-slate-600">
                  {formatProductStockLabel(p.stock, saleUnit, packQty)} · {p.status}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.status === 'published' ? (
                    <Link href={`/shop/${p.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </Link>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Category *</Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(v) => setEditForm({ ...editForm, categoryId: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {shopCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                className="mt-1"
                value={editForm.sku}
                onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sold as</Label>
                <Select
                  value={editForm.saleUnit}
                  onValueChange={(v) =>
                    setEditForm({
                      ...editForm,
                      saleUnit: v as ProductSaleUnit,
                      packQuantity:
                        v === 'piece'
                          ? '1'
                          : editForm.packQuantity === '1'
                            ? '6'
                            : editForm.packQuantity,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_SALE_UNITS.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pieces per pack / set</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  disabled={editForm.saleUnit === 'piece'}
                  value={editForm.packQuantity}
                  onChange={(e) => setEditForm({ ...editForm, packQuantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Cost price</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={editForm.costPrice}
                  onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <ImageUploadField
              label="Product image"
              folder="products"
              value={editForm.imageUrl}
              onChange={(url) => setEditForm({ ...editForm, imageUrl: url })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || !editForm.categoryId}
              className="bg-[var(--brand-navy)]"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
