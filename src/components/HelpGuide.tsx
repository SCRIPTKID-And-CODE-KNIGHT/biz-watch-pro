import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  LayoutDashboard,
  X,
  HelpCircle,
  Trash2,
} from 'lucide-react';

const adminGuide = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'View an overview of your inventory: total products, low stock alerts, today\'s sales, and total inventory value.',
  },
  {
    icon: Package,
    title: 'Products',
    description: 'Add, edit, and delete products. Set prices in TZS, track stock quantities, and define minimum stock levels for alerts.',
  },
  {
    icon: ShoppingCart,
    title: 'Sales',
    description: 'Record sales transactions. Filter by day, week, month, or a custom date. As admin, you can also delete sales records.',
  },
  {
    icon: AlertTriangle,
    title: 'Alerts',
    description: 'Monitor products that have fallen below their minimum stock level so you can restock on time.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Add new staff members with email and password. Manage team roles. Only admins can access this section.',
  },
  {
    icon: Trash2,
    title: 'Deleting Records',
    description: 'As admin, you can delete products from the Products page and sales records from the Sales page using the trash icon.',
  },
];

const staffGuide = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'View a summary of inventory stats: total products, low stock items, today\'s sales, and inventory value.',
  },
  {
    icon: Package,
    title: 'Products',
    description: 'Add new products and edit existing ones. Set prices, quantities, SKUs, and categories.',
  },
  {
    icon: ShoppingCart,
    title: 'Sales',
    description: 'Record sales by selecting a product and quantity. The system automatically calculates the total and updates stock.',
  },
  {
    icon: AlertTriangle,
    title: 'Alerts',
    description: 'Check which products are running low on stock so you can notify your admin to reorder.',
  },
];

export function HelpGuide() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);

  const storageKey = `help-dismissed-${role}`;

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed && role) {
      setOpen(true);
    }
  }, [role, storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setOpen(false);
  };

  const guide = role === 'admin' ? adminGuide : staffGuide;

  return (
    <>
      {/* Floating help button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 border-0"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Welcome! Here's how to use StockPilot
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            You are logged in as <span className="font-semibold text-foreground capitalize">{role}</span>. Here's what you can do:
          </p>
          <div className="space-y-3">
            {guide.map((item) => (
              <Card key={item.title} className="border border-border">
                <CardContent className="flex gap-3 p-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={handleDismiss} className="w-full mt-4">
            Got it, let's go!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
