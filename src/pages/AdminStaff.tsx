import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStaff() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const { data: roles, error } = await supabase.from('user_roles').select('*, profiles:user_id(full_name, email)');
      if (error) throw error;
      return roles;
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: async () => {
      // Sign up the staff user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Failed to create user');

      // Assign staff role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'staff' });
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
      setDialogOpen(false);
      setEmail('');
      setPassword('');
      setFullName('');
      toast.success('Staff member added successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
      toast.success('Role removed');
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (role !== 'admin') {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-description">Add staff members and manage roles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-1" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addStaffMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={addStaffMutation.isPending}>
                {addStaffMutation.isPending ? 'Adding...' : 'Add Staff Member'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {staffList.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No team members yet. Add your first staff member.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.role === 'admin' ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
                      {item.profiles?.full_name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.profiles?.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={item.role === 'admin' ? 'default' : 'secondary'}>
                      {item.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.role !== 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => removeRoleMutation.mutate(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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
