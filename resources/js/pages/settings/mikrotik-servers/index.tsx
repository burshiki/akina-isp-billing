import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface Coverage {
    id: number;
    name: string;
}

interface MikrotikServer {
    id: number;
    name: string;
    host: string;
    username: string;
    password: string;
    port: number;
    is_active: boolean;
    coverage_id: number;
    coverage: Coverage;
}

interface FlashMessage {
    success?: string;
    error?: string;
}

type FormData = {
    name: string;
    host: string;
    username: string;
    password: string;
    port: number;
    is_active: boolean;
    coverage_id: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Mikrotik Servers',
        href: '/settings/mikrotik-servers',
    },
];

export default function MikrotikServers({ mikrotikServers = [], coverages = [], flash }: { 
    mikrotikServers: MikrotikServer[]; 
    coverages: Coverage[];
    flash: FlashMessage;
}) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<MikrotikServer | null>(null);
    const [editingServer, setEditingServer] = useState<MikrotikServer | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setIsSuccessModalOpen(true);
        }
    }, [flash]);

    const { data, setData, post, put, processing, reset, errors } = useForm<FormData>({
        name: '',
        host: '',
        username: '',
        password: '',
        port: 8728,
        is_active: true,
        coverage_id: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServer) {
            put(route('mikrotik-servers.update', editingServer.id), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setEditingServer(null);
                    reset();
                },
            });
        } else {
            post(route('mikrotik-servers.store'), {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (server: MikrotikServer) => {
        setEditingServer(server);
        setData({
            name: server.name,
            host: server.host,
            username: server.username || '',
            password: server.password || '',
            port: server.port,
            is_active: server.is_active,
            coverage_id: server.coverage_id,
        });
        setIsAddDialogOpen(true);
    };

    const handleDeleteClick = (server: MikrotikServer) => {
        setServerToDelete(server);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (serverToDelete) {
            router.delete(route('mikrotik-servers.destroy', serverToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setServerToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mikrotik Servers" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Mikrotik Servers</h1>
                        <p className="text-muted-foreground">Manage your Mikrotik PPPoE servers</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Server</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingServer ? 'Edit Server' : 'Add New Server'}</DialogTitle>
                                <DialogDescription>
                                    Fill in the server details.
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
                                        <Label htmlFor="host">Host</Label>
                                        <Input
                                            id="host"
                                            value={data.host}
                                            onChange={e => setData('host', e.target.value)}
                                            placeholder="IP address or hostname"
                                        />
                                        {errors.host && <p className="text-sm text-red-500 mt-1">{errors.host}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={data.username}
                                            onChange={e => setData('username', e.target.value)}
                                        />
                                        {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="port">Port</Label>
                                        <Input
                                            id="port"
                                            type="number"
                                            value={data.port}
                                            onChange={e => setData('port', parseInt(e.target.value))}
                                        />
                                        {errors.port && <p className="text-sm text-red-500 mt-1">{errors.port}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="coverage_id">Coverage Area</Label>
                                        <Select
                                            value={data.coverage_id.toString()}
                                            onValueChange={value => setData('coverage_id', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a coverage area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {coverages.map(coverage => (
                                                    <SelectItem key={coverage.id} value={coverage.id.toString()}>
                                                        {coverage.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.coverage_id && <p className="text-sm text-red-500 mt-1">{errors.coverage_id}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                                            if (checked === 'indeterminate') return;
                                            setData('is_active', checked);
                                        }}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            setEditingServer(null);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingServer ? 'Update Server' : 'Add Server'}
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
                                    Delete Server
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the server "{serverToDelete?.name}"? This action cannot be undone.
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
                                    Delete Server
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    Success
                                </DialogTitle>
                                <DialogDescription>
                                    {flash?.success}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button onClick={() => setIsSuccessModalOpen(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Server List</CardTitle>
                            <CardDescription>List of all registered Mikrotik servers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {mikrotikServers.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No servers available yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Name</th>
                                                <th className="text-left py-3 px-4">IP Address</th>
                                                <th className="text-left py-3 px-4">Coverage Area</th>
                                                <th className="text-right py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mikrotikServers.map((server) => (
                                                <tr key={server.id} className="border-b">
                                                    <td className="py-3 px-4">{server.name}</td>
                                                    <td className="py-3 px-4">{server.host}</td>
                                                    <td className="py-3 px-4">{server.coverage.name}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(server)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(server)}
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
