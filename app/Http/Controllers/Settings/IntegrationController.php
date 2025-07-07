<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Coverage;
use App\Models\MikrotikServer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/integrations/index', [
            'coverages' => Coverage::with('mikrotikServers')->get(),
            'mikrotikServers' => MikrotikServer::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'coverage_id' => ['required', 'exists:coverages,id'],
            'mikrotik_server_id' => ['required', 'exists:mikrotik_servers,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $coverage = Coverage::findOrFail($validated['coverage_id']);
        $coverage->mikrotikServers()->attach($validated['mikrotik_server_id'], [
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Integration added successfully.');
    }

    public function update(Request $request, Coverage $coverage, MikrotikServer $mikrotikServer)
    {
        $validated = $request->validate([
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $coverage->mikrotikServers()->updateExistingPivot($mikrotikServer->id, $validated);

        return back()->with('success', 'Integration updated successfully.');
    }

    public function destroy(Coverage $coverage, MikrotikServer $mikrotikServer)
    {
        $coverage->mikrotikServers()->detach($mikrotikServer->id);

        return back()->with('success', 'Integration removed successfully.');
    }
}
