import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, AlertTriangle, GitMerge } from 'lucide-react';
import { useState } from 'react';

interface Coverage {
    id: number;
    name: string;
    mikrotik_servers: MikrotikServer[];
}

interface MikrotikServer {
    id: number;
    name: string;
    host: string;
    pivot?: {
        description: string;
        is_active: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Integrations',
        href: '/settings/integrations',
    },
];

export default function Integrations({ coverages = [], mikrotikServers = [] }: { coverages: Coverage[]; mikrotikServers: MikrotikServer[]; }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCoverage, setSelectedCoverage] = useState<Coverage | null>(null);
    const [selectedServer, setSelectedServer] = useState<MikrotikServer | null>(null);

    const { data, setData, post, processing, reset } = useForm<{
        coverage_id: string;
        mikrotik_server_id: string;
        description: string;
        is_active: true | false;
    }>({
        coverage_id: '',
        mikrotik_server_id: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('integrations.store'), {
            onSuccess: () => {
                setIsAddDialogOpen(false);
                reset();
            },
        });
    };

    const handleDeleteClick = (coverage: Coverage, server: MikrotikServer) => {
        setSelectedCoverage(coverage);
        setSelectedServer(server);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedCoverage && selectedServer) {
            router.delete(route('integrations.destroy', {
                coverage: selectedCoverage.id,
                mikrotikServer: selectedServer.id,
            }), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedCoverage(null);
                    setSelectedServer(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Integrations" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Coverage Area Integrations</h1>
                        <p className="text-muted-foreground">Manage Mikrotik server integrations for each coverage area</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Integration</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Integration</DialogTitle>
                                <DialogDescription>
                                    Link a Mikrotik server to a coverage area.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="coverage_id">Coverage Area</Label>
                                    <Select
                                        value={data.coverage_id}
                                        onValueChange={value => setData('coverage_id', value)}
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
                                </div>
                                <div>
                                    <Label htmlFor="mikrotik_server_id">Mikrotik Server</Label>
                                    <Select
                                        value={data.mikrotik_server_id}
                                        onValueChange={value => setData('mikrotik_server_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Mikrotik server" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mikrotikServers.map(server => (
                                                <SelectItem key={server.id} value={server.id.toString()}>
                                                    {server.name} ({server.host})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Optional description for this integration"
                                    />
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
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Add Integration
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    {coverages.map(coverage => (
                        <Card key={coverage.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitMerge className="h-5 w-5" />
                                    {coverage.name}
                                </CardTitle>
                                <CardDescription>
                                    Mikrotik server integrations for this coverage area
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Server Name</TableHead>
                                            <TableHead>Host</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coverage.mikrotik_servers.map(server => (
                                            <TableRow key={server.id}>
                                                <TableCell>{server.name}</TableCell>
                                                <TableCell>{server.host}</TableCell>
                                                <TableCell>{server.pivot?.description || '-'}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            server.pivot?.is_active
                                                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                        }`}
                                                    >
                                                        {server.pivot?.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(coverage, server)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {coverage.mikrotik_servers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                    No integrations found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Integration</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this integration? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 rounded-lg border p-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <div className="text-sm">
                            <p className="font-medium">Warning</p>
                            <p className="text-muted-foreground">
                                Removing this integration will disconnect the Mikrotik server from this coverage area.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setSelectedCoverage(null);
                                setSelectedServer(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete Integration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
} 