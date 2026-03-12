import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatTZS } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Plus, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRange = 'today' | 'week' | 'month' | 'custom' | 'all';

export default function Sales() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
      case 'week':
        return { from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(), to: endOfWeek(now, { weekStartsOn: 1 }).toISOString() };
      case 'month':
        return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() };
      case 'custom':
        if (customDate) return { from: startOfDay(customDate).toISOString(), to: endOfDay(customDate).toISOString() };
        return null;
      default:
        return null;
    }
  };

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', dateRange, customDate?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      const filter = getDateFilter();
      if (filter) {
        query = query.gte('created_at', filter.from).lte('created_at', filter.to);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query;
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-today'] });
      toast.success('Sale deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const totalFiltered = sales.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0);

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
                        {p.name} — {p.quantity} in stock @ {formatTZS(Number(p.price))}
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
                    <span>{formatTZS(Number(selectedProduct.price))}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-1">
                    <span>Total</span>
                    <span>{formatTZS(Number(selectedProduct.price) * (parseInt(quantity) || 0))}</span>
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

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['all', 'today', 'week', 'month', 'custom'] as DateRange[]).map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(range)}
          >
            {range === 'all' ? 'All' : range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Pick Date'}
          </Button>
        ))}
        {dateRange === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn(!customDate && 'text-muted-foreground')}>
                <CalendarDays className="h-4 w-4 mr-1" />
                {customDate ? format(customDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={setCustomDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        )}
        {dateRange !== 'all' && sales.length > 0 && (
          <span className="text-sm text-muted-foreground ml-auto">
            {sales.length} sale{sales.length !== 1 ? 's' : ''} · Total: <span className="font-semibold text-foreground">{formatTZS(totalFiltered)}</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading sales...</p>
      ) : sales.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No sales recorded{dateRange !== 'all' ? ' for this period' : ' yet'}.</p>
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
                {role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.products?.name}</TableCell>
                  <TableCell>{s.quantity}</TableCell>
                  <TableCell>{formatTZS(Number(s.total_amount))}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                  {role === 'admin' && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
