import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface InternetPackage {
    id: number;
    name: string;
    price: number;
    category: 'fiber' | 'wireless';
    status: 'active' | 'inactive';
    remarks?: string;
    image_path?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Internet Plans',
        href: '/plans',
    },
];

export default function Plans({ packages = [] }: { packages: InternetPackage[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<InternetPackage | null>(null);
    const [editingPackage, setEditingPackage] = useState<InternetPackage | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        price: '',
        category: 'fiber',
        status: 'active',
        remarks: '',
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPackage) {
            put(route('plans.update', editingPackage.id), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setEditingPackage(null);
                    reset();
                },
            });
        } else {
            post(route('plans.store'), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (pkg: InternetPackage) => {
        setEditingPackage(pkg);
        setData({
            name: pkg.name,
            price: pkg.price.toString(),
            category: pkg.category,
            status: pkg.status,
            remarks: pkg.remarks || '',
            image: null,
        });
        setIsAddDialogOpen(true);
    };

    const handleDeleteClick = (pkg: InternetPackage) => {
        setPackageToDelete(pkg);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (packageToDelete) {
            router.delete(route('plans.destroy', packageToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setPackageToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Internet Plans" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Internet Plans</h1>
                        <p className="text-muted-foreground">Manage your internet service plans</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Package</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for the internet package.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <Label htmlFor="price">Price (₱)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                    />
                                    {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('category', e.target.value)}
                                        className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                    >
                                        <option value="fiber">Fiber</option>
                                        <option value="wireless">Wireless</option>
                                    </select>
                                    {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('status', e.target.value)}
                                        className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <textarea
                                        id="remarks"
                                        className="w-full rounded-md border border-input px-3 py-2"
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image">Package Banner</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('image', e.target.files?.[0] || null)}
                                    />
                                    {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            setEditingPackage(null);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingPackage ? 'Update Package' : 'Add Package'}
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
                                    Delete Package
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the package "{packageToDelete?.name}"? This action cannot be undone.
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
                                    Delete Package
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Plans</CardTitle>
                            <CardDescription>List of all available internet service plans</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {packages.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No plans available yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Name</th>
                                                <th className="text-left py-3 px-4">Price</th>
                                                <th className="text-left py-3 px-4">Category</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Remarks</th>
                                                <th className="text-right py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packages.map((pkg) => (
                                                <tr key={pkg.id} className="border-b">
                                                    <td className="py-3 px-4">{pkg.name}</td>
                                                    <td className="py-3 px-4">₱{pkg.price.toLocaleString()}</td>
                                                    <td className="py-3 px-4 capitalize">{pkg.category}</td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded text-xs ${
                                                                pkg.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {pkg.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">{pkg.remarks}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(pkg)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(pkg)}
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