import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { formatTZS } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: salesToday = [] } = useQuery({
    queryKey: ['sales-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('sales')
        .select('*, products(name)')
        .gte('created_at', today);
      if (error) throw error;
      return data;
    },
  });

  const totalProducts = products.length;
  const lowStockItems = products.filter((p: any) => p.quantity <= p.min_stock_level);
  const totalSalesToday = salesToday.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0);
  const totalInventoryValue = products.reduce((sum: number, p: any) => sum + (Number(p.price) * p.quantity), 0);

  const stats = [
    { title: 'Total Products', value: totalProducts, icon: Package, color: 'text-primary' },
    { title: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, color: 'text-warning' },
    { title: 'Sales Today', value: formatTZS(totalSalesToday), icon: DollarSign, color: 'text-success' },
    { title: 'Inventory Value', value: formatTZS(totalInventoryValue), icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of your inventory system</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold font-display mb-4">Low Stock Alerts</h2>
          <div className="grid gap-3">
            {lowStockItems.map((p: any) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {p.sku || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.quantity === 0 ? 'destructive' : 'secondary'}>
                    {p.quantity} / {p.min_stock_level} min
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {salesToday.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold font-display mb-4">Recent Sales Today</h2>
          <div className="grid gap-3">
            {salesToday.slice(0, 5).map((s: any) => (
              <Card key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{s.products?.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {s.quantity}</p>
                </div>
                <p className="font-semibold">${Number(s.total_amount).toFixed(2)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
