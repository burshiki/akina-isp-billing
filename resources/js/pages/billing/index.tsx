import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing',
        href: '/billing',
    },
];

interface Customer {
    id: number;
    name: string;
    plan_name: string;
    plan_price: number;
    payment_type: 'postpaid' | 'prepaid';
    due_date?: number;
    activation_date: string;
}

interface Invoice {
    id: number;
    invoice_no: string;
    customer_name: string;
    plan_name: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    due_date: string;
    start_date: string;
    end_date: string;
    billing_type: 'full' | 'prorated';
    remarks?: string;
    customer_id: number;
}

type FormData = {
    customer_id: string;
    remarks: string;
    amount: number;
    start_date: string;
    end_date: string;
    billing_type: 'full' | 'prorated';
}

export default function BillingPage({ invoices = [], customers = [] }: { 
    invoices: Invoice[]; 
    customers: Customer[];
}) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState('');
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm<FormData>({
        customer_id: '',
        remarks: '',
        amount: 0,
        start_date: '',
        end_date: '',
        billing_type: 'full',
    });

    const handleCustomerChange = (customerId: string) => {
        setData('customer_id', customerId);
        const customer = customers.find(c => c.id === parseInt(customerId)) || null;
        if (customer && !editingInvoice) {
            calculateBillingDetails(customer);
        } else if (!customer) {
            // If "Select a customer" is chosen, reset relevant data fields
            setData({
                ...data,
                customer_id: '',
                amount: 0,
                start_date: '',
                end_date: '',
                billing_type: 'full',
            });
        }
    };

    const calculateBillingDetails = (customer: Customer) => {
        const today = new Date();
        const activationDate = new Date(customer.activation_date);
        const planPrice = customer.plan_price;

        let startDate: Date;
        let endDate: Date;
        let isProrated: boolean;
        let daysInFullBillingCycle: number;

        if (customer.payment_type === 'postpaid' && customer.due_date) {
            let firstBillEndDate = new Date(today.getFullYear(), today.getMonth(), customer.due_date);

            // If the due date for the current month has already passed relative to activation,
            // set the end date to the next month's due date.
            if (firstBillEndDate < activationDate) {
                firstBillEndDate = new Date(today.getFullYear(), today.getMonth() + 1, customer.due_date);
            }

            startDate = activationDate;
            endDate = firstBillEndDate;
            isProrated = true;
            daysInFullBillingCycle = 30; // Fixed 30 days for postpaid prorated
        } else {
            // Prepaid or postpaid without a specific due date, bill for the current month
            const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            startDate = activationDate > firstDayOfCurrentMonth ? activationDate : firstDayOfCurrentMonth;
            endDate = lastDayOfCurrentMonth;
            isProrated = activationDate > firstDayOfCurrentMonth;
            daysInFullBillingCycle = lastDayOfCurrentMonth.getDate(); // Actual days in month for prepaid/full month
        }

        // Calculate daysToCharge: difference in days (exclusive of end date, or inclusive of start and exclusive of end)
        const daysToCharge = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const computedAmountValue = (planPrice / daysInFullBillingCycle) * daysToCharge;

        setData({
            ...data,
            customer_id: customer.id.toString(), // Explicitly set customer_id
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            billing_type: isProrated ? 'prorated' : 'full',
            amount: Math.round(computedAmountValue * 100) / 100,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
        };

        if (editingInvoice) {
            put(route('billing.update', editingInvoice.id), submitData, {
                onSuccess: () => {
                    console.log('Update successful, attempting to close dialog.');
                    setIsAddDialogOpen(false);
                    reset();
                    setSelectedCustomer(null);
                    setEditingInvoice(null);
                },
                onError: (errors) => {
                    console.error('Update failed:', errors);
                    setErrorDialogMessage('Failed to update invoice. Please check the form for errors.');
                    setIsErrorDialogOpen(true);
                },
            });
        } else {
            post(route('billing.store', submitData), {
                onSuccess: () => {
                    console.log('Store successful, attempting to close dialog.');
                    setIsAddDialogOpen(false);
                    reset();
                    setSelectedCustomer(null);
                },
                onError: (errors) => {
                    console.error('Store failed:', errors);
                    setErrorDialogMessage('Failed to create invoice. Please check the form for errors.');
                    setIsErrorDialogOpen(true);
                },
            });
        }
    };

    const handleDeleteClick = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (invoiceToDelete) {
            router.delete(route('billing.destroy', invoiceToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setInvoiceToDelete(null);
                },
            });
        }
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setData({
            customer_id: invoice.customer_id.toString(),
            remarks: invoice.remarks || '',
            amount: invoice.amount,
            start_date: invoice.start_date,
            end_date: invoice.end_date,
            billing_type: invoice.billing_type,
        } as FormData);
        setIsAddDialogOpen(true);
    };

    const currentSelectedCustomer = customers.find(c => c.id === parseInt(data.customer_id)) || null;
    console.log('Render - data.customer_id:', data.customer_id);
    console.log('Render - currentSelectedCustomer:', currentSelectedCustomer);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
                        <p className="text-muted-foreground">Manage customer invoices and payments</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                        console.log('Dialog onOpenChange called with open:', open);
                        setIsAddDialogOpen(open);
                        if (!open) {
                            setEditingInvoice(null);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
                                <DialogDescription>
                                    Create a new invoice for a customer
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="customer_id">Customer</Label>
                                    {editingInvoice ? (
                                        <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-gray-100">
                                            {selectedCustomer?.name}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <select
                                                id="customer_id"
                                                value={data.customer_id}
                                                onChange={(e) => handleCustomerChange(e.target.value)}
                                                className="flex-1 rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                            >
                                                <option value="">Select a customer</option>
                                                {customers.map((customer) => (
                                                    <option key={customer.id} value={customer.id.toString()}>
                                                        {customer.name} - {customer.plan_name}
                                                    </option>
                                                ))}
                                            </select>
                                            
                                        </div>
                                    )}
                                    {errors.customer_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.customer_id}</p>
                                    )}
                                </div>

                                {currentSelectedCustomer && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Activation Date</Label>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(currentSelectedCustomer.activation_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Payment Type</Label>
                                                <div className="text-sm text-muted-foreground capitalize">
                                                    {currentSelectedCustomer.payment_type}
                                                    {currentSelectedCustomer.payment_type === 'postpaid' && currentSelectedCustomer.due_date && 
                                                        ` (Due: Day ${currentSelectedCustomer.due_date})`}
                                                </div>
                                            </div>
                                        </div>

                                        {data.start_date && data.end_date && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Billing Period</Label>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(data.start_date).toLocaleDateString()} to{' '}
                                                            {new Date(data.end_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Billing Type</Label>
                                                        <div className="text-sm text-muted-foreground capitalize">
                                                            {data.billing_type === 'prorated' ? 'Prorated' : 'Full Month'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="amount">Amount</Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        step="0.01"
                                                        value={data.amount}
                                                        onChange={e => setData('amount', parseFloat(e.target.value))}
                                                    />
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
                                            </>
                                        )}
                                    </>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            reset();
                                            setData('customer_id', '');
                                            setData('remarks', '');
                                            setData('amount', 0);
                                            setData('start_date', '');
                                            setData('end_date', '');
                                            setData('billing_type', 'full');
                                            setEditingInvoice(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing || !currentSelectedCustomer || data.amount === 0}>
                                        {editingInvoice ? 'Update Invoice' : 'Generate Bill'}
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
                                    Delete Invoice
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the invoice "{invoiceToDelete?.invoice_no}"? This action cannot be undone.
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
                                    Delete Invoice
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Error
                                </DialogTitle>
                                <DialogDescription>
                                    {errorDialogMessage}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex gap-2 justify-end mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsErrorDialogOpen(false)}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice List</CardTitle>
                            <CardDescription>List of all customer invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No invoices available yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Invoice #</th>
                                                <th className="text-left py-3 px-4">Customer</th>
                                                <th className="text-left py-3 px-4">Plan</th>
                                                <th className="text-left py-3 px-4">Amount</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Due Date</th>
                                                <th className="text-right py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id} className="border-b">
                                                    <td className="py-3 px-4">{invoice.invoice_no}</td>
                                                    <td className="py-3 px-4">{invoice.customer_name}</td>
                                                    <td className="py-3 px-4">{invoice.plan_name}</td>
                                                    <td className="py-3 px-4">₱{Number(invoice.amount).toFixed(2)}</td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded text-xs ${
                                                                invoice.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : invoice.status === 'paid'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">{new Date(invoice.due_date).toLocaleDateString()}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(invoice)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(invoice)}
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