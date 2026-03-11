import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Sales() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const selectedProduct = products.find((p: any) => p.id === productId);

  const sellMutation = useMutation({
    mutationFn: async () => {
      const qty = parseInt(quantity);
      if (!productId || qty < 1) throw new Error('Select a product and valid quantity');
      const { error } = await supabase.rpc('record_sale', {
        _product_id: productId,
        _quantity: qty,
        _sold_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-today'] });
      setDialogOpen(false);
      setProductId('');
      setQuantity('1');
      toast.success('Sale recorded & inventory updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-description">Record sales and track transactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Record Sale</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record a Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); sellMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter((p: any) => p.quantity > 0).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.quantity} in stock @ ${Number(p.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedProduct?.quantity || 1}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>
              {selectedProduct && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit price</span>
                    <span>${Number(selectedProduct.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-1">
                    <span>Total</span>
                    <span>${(Number(selectedProduct.price) * (parseInt(quantity) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={sellMutation.isPending || !productId}>
                {sellMutation.isPending ? 'Processing...' : 'Confirm Sale'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading sales...</p>
      ) : sales.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No sales recorded yet.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.products?.name}</TableCell>
                  <TableCell>{s.quantity}</TableCell>
                  <TableCell>${Number(s.total_amount).toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
