import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, PackageX } from 'lucide-react';

export default function Alerts() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    },
  });

  const lowStock = products.filter((p: any) => p.quantity <= p.min_stock_level);
  const outOfStock = lowStock.filter((p: any) => p.quantity === 0);
  const warning = lowStock.filter((p: any) => p.quantity > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Alerts</h1>
        <p className="page-description">{lowStock.length} items need attention</p>
      </div>

      {outOfStock.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
            <PackageX className="h-5 w-5 text-destructive" /> Out of Stock
          </h2>
          <div className="grid gap-3">
            {outOfStock.map((p: any) => (
              <Card key={p.id} className="flex items-center justify-between p-4 border-destructive/30">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {p.sku || 'N/A'} · Min: {p.min_stock_level}</p>
                </div>
                <Badge variant="destructive">Out of Stock</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {warning.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Low Stock
          </h2>
          <div className="grid gap-3">
            {warning.map((p: any) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {p.sku || 'N/A'} · Min: {p.min_stock_level}</p>
                </div>
                <Badge variant="secondary">{p.quantity} remaining</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {lowStock.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">All products are well stocked! 🎉</p>
        </Card>
      )}
    </div>
  );
}
