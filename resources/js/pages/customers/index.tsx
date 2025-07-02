import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    account_no: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    customer_type: 'public' | 'corporate' | 'government';
    id_card_type: 'umid' | 'sss' | 'sim' | 'passport' | 'pag-ibig';
    id_number: string;
    remarks?: string;
    plan_id: number;
    plan_name: string;
    status: 'active' | 'inactive';
    payment_type: 'postpaid' | 'prepaid';
    due_date?: number;
    is_tax_active: boolean;
    created_at: string;
}

interface Plan {
    id: number;
    name: string;
}

type CustomerType = 'public' | 'corporate' | 'government';
type IdCardType = 'umid' | 'sss' | 'sim' | 'passport' | 'pag-ibig';
type PaymentType = 'postpaid' | 'prepaid';
type StatusType = 'active' | 'inactive';

type FormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    customer_type: CustomerType;
    id_card_type: IdCardType | '';
    id_number: string;
    remarks: string;
    plan_id: string;
    status: StatusType;
    payment_type: PaymentType;
    due_date: string;
    is_tax_active: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

export default function Customers({ customers = [], plans = [] }: { customers: Customer[]; plans: Plan[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'public' as const,
        id_card_type: '' as const,
        id_number: '',
        remarks: '',
        plan_id: '',
        status: 'active' as const,
        payment_type: 'postpaid' as const,
        due_date: '',
        is_tax_active: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            put(route('customers.update', editingCustomer.id), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setEditingCustomer(null);
                    reset();
                },
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            customer_type: customer.customer_type,
            id_card_type: customer.id_card_type,
            id_number: customer.id_number,
            remarks: customer.remarks,
            plan_id: customer.plan_id.toString(),
            status: customer.status,
            payment_type: customer.payment_type,
            due_date: customer.due_date?.toString(),
            is_tax_active: customer.is_tax_active,
        });
        setIsAddDialogOpen(true);
    };

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (customerToDelete) {
            router.delete(route('customers.destroy', customerToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setCustomerToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
                        <p className="text-muted-foreground">Manage your internet service customers</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Customer</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                                <DialogDescription>
                                    Fill in the customer details.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                        />
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                        />
                                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="customer_type">Customer Type</Label>
                                        <select
                                            id="customer_type"
                                            value={data.customer_type}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                                setData('customer_type', e.target.value as CustomerType)}
                                            className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                        >
                                            <option value="">Select type</option>
                                            <option value="public">Public</option>
                                            <option value="corporate">Corporate</option>
                                            <option value="government">Government</option>
                                        </select>
                                        {errors.customer_type && <p className="text-sm text-red-500 mt-1">{errors.customer_type}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <textarea
                                        id="address"
                                        className="w-full rounded-md border border-input px-3 py-2"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="id_card_type">ID Card Type</Label>
                                        <select
                                            id="id_card_type"
                                            value={data.id_card_type}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                                setData('id_card_type', e.target.value as IdCardType)}
                                            className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                        >
                                            <option value="">Select ID type</option>
                                            <option value="umid">UMID</option>
                                            <option value="sss">SSS</option>
                                            <option value="sim">SIM</option>
                                            <option value="passport">Passport</option>
                                            <option value="pag-ibig">Pag-IBIG</option>
                                        </select>
                                        {errors.id_card_type && <p className="text-sm text-red-500 mt-1">{errors.id_card_type}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="id_number">ID Number</Label>
                                        <Input
                                            id="id_number"
                                            value={data.id_number}
                                            onChange={e => setData('id_number', e.target.value)}
                                        />
                                        {errors.id_number && <p className="text-sm text-red-500 mt-1">{errors.id_number}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="plan_id">Internet Plan</Label>
                                        <select
                                            id="plan_id"
                                            value={data.plan_id}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('plan_id', e.target.value)}
                                            className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                        >
                                            <option value="">Select a plan</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.plan_id && <p className="text-sm text-red-500 mt-1">{errors.plan_id}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="payment_type">Payment Type</Label>
                                        <select
                                            id="payment_type"
                                            value={data.payment_type}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                                setData('payment_type', e.target.value as PaymentType)}
                                            className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                        >
                                            <option value="postpaid">Postpaid</option>
                                            <option value="prepaid">Prepaid</option>
                                        </select>
                                        {errors.payment_type && <p className="text-sm text-red-500 mt-1">{errors.payment_type}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                                setData('status', e.target.value as StatusType)}
                                            className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                                    </div>
                                    {data.payment_type === 'postpaid' && (
                                        <div>
                                            <Label htmlFor="due_date">Due Date (Day of Month)</Label>
                                            <Input
                                                id="due_date"
                                                type="number"
                                                min={1}
                                                max={31}
                                                value={data.due_date}
                                                onChange={e => setData('due_date', e.target.value)}
                                            />
                                            {errors.due_date && <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_tax_active"
                                        checked={data.is_tax_active}
                                        onChange={e => setData('is_tax_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_tax_active">Tax Active</Label>
                                    {errors.is_tax_active && <p className="text-sm text-red-500 mt-1">{errors.is_tax_active}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <textarea
                                        id="remarks"
                                        className="w-full rounded-md border border-input px-3 py-2"
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            setEditingCustomer(null);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingCustomer ? 'Update Customer' : 'Add Customer'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Delete Customer
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the customer "{customerToDelete?.name}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex gap-2 justify-end mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                >
                                    Delete Customer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer List</CardTitle>
                            <CardDescription>List of all registered customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {customers.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No customers available yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Account No.</th>
                                                <th className="text-left py-3 px-4">Name</th>
                                                <th className="text-left py-3 px-4">Email</th>
                                                <th className="text-left py-3 px-4">Phone</th>
                                                <th className="text-left py-3 px-4">Type</th>
                                                <th className="text-left py-3 px-4">Plan</th>
                                                <th className="text-left py-3 px-4">Payment</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-right py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.map((customer) => (
                                                <tr key={customer.id} className="border-b">
                                                    <td className="py-3 px-4">{customer.account_no}</td>
                                                    <td className="py-3 px-4">{customer.name}</td>
                                                    <td className="py-3 px-4">{customer.email}</td>
                                                    <td className="py-3 px-4">{customer.phone}</td>
                                                    <td className="py-3 px-4 capitalize">{customer.customer_type}</td>
                                                    <td className="py-3 px-4">{customer.plan_name}</td>
                                                    <td className="py-3 px-4 capitalize">{customer.payment_type}</td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded text-xs ${
                                                                customer.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {customer.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(customer)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(customer)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 