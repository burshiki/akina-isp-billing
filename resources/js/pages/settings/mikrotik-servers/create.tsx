import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Coverage {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Mikrotik Servers',
        href: route('mikrotik-servers.index'),
    },
    {
        title: 'Create',
        href: route('mikrotik-servers.create'),
    },
];

export default function CreateMikrotikServer({ coverages }: { coverages: Coverage[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        ip_address: '',
        coverage_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mikrotik-servers.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Mikrotik Server" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Mikrotik Server</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                    <Label htmlFor="ip_address">IP Address</Label>
                                    <Input
                                        id="ip_address"
                                        value={data.ip_address}
                                        onChange={e => setData('ip_address', e.target.value)}
                                    />
                                    {errors.ip_address && <p className="text-sm text-red-500 mt-1">{errors.ip_address}</p>}
                                </div>
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
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Create Server
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
