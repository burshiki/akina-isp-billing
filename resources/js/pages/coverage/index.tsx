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

interface CoverageArea {
    id: number;
    area_code: string;
    name: string;
    address: string;
    remarks?: string;
    total_customers: number;
}

type FormData = {
    area_code: string;
    name: string;
    address: string;
    remarks: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Coverage',
        href: '/coverage',
    },
];

export default function Coverage({ areas = [] }: { areas: CoverageArea[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [areaToDelete, setAreaToDelete] = useState<CoverageArea | null>(null);
    const [editingArea, setEditingArea] = useState<CoverageArea | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm<FormData>({
        area_code: '',
        name: '',
        address: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingArea) {
            put(route('coverage.update', editingArea.id), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setEditingArea(null);
                    reset();
                },
            });
        } else {
            post(route('coverage.store'), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (area: CoverageArea) => {
        setEditingArea(area);
        setData({
            area_code: area.area_code,
            name: area.name,
            address: area.address,
            remarks: area.remarks || '',
        });
        setIsAddDialogOpen(true);
    };

    const handleDeleteClick = (area: CoverageArea) => {
        setAreaToDelete(area);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (areaToDelete) {
            router.delete(route('coverage.destroy', areaToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setAreaToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coverage Areas" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Coverage Areas</h1>
                        <p className="text-muted-foreground">Manage your internet service coverage areas</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Area</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingArea ? 'Edit Area' : 'Add New Area'}</DialogTitle>
                                <DialogDescription>
                                    Fill in the coverage area details.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="area_code">Area Code</Label>
                                        <Input
                                            id="area_code"
                                            value={data.area_code}
                                            onChange={e => setData('area_code', e.target.value)}
                                        />
                                        {errors.area_code && <p className="text-sm text-red-500 mt-1">{errors.area_code}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Area Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                        />
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
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

                                <div>
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <textarea
                                        id="remarks"
                                        className="w-full rounded-md border border-input px-3 py-2"
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                    />
                                    {errors.remarks && <p className="text-sm text-red-500 mt-1">{errors.remarks}</p>}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            setEditingArea(null);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingArea ? 'Update Area' : 'Add Area'}
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
                                    Delete Area
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the area "{areaToDelete?.name}"? This action cannot be undone.
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
                                    Delete Area
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Coverage Areas</CardTitle>
                            <CardDescription>List of all service coverage areas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {areas.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No coverage areas available yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Area Code</th>
                                                <th className="text-left py-3 px-4">Name</th>
                                                <th className="text-left py-3 px-4">Address</th>
                                                <th className="text-left py-3 px-4">Total Customers</th>
                                                <th className="text-left py-3 px-4">Remarks</th>
                                                <th className="text-right py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {areas.map((area) => (
                                                <tr key={area.id} className="border-b">
                                                    <td className="py-3 px-4">{area.area_code}</td>
                                                    <td className="py-3 px-4">{area.name}</td>
                                                    <td className="py-3 px-4">{area.address}</td>
                                                    <td className="py-3 px-4">{area.total_customers}</td>
                                                    <td className="py-3 px-4">{area.remarks || '-'}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(area)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(area)}
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