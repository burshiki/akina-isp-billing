<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Coverage;
use App\Models\MikrotikServer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MikrotikServerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('settings/mikrotik-servers/index', [
            'mikrotikServers' => MikrotikServer::with('coverage')->get(),
            'coverages' => Coverage::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('settings/mikrotik-servers/create', [
            'coverages' => Coverage::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'boolean',
            'coverage_id' => 'required|exists:coverages,id',
        ]);

        MikrotikServer::create($request->all());

        return redirect()->route('mikrotik-servers.index')->with('success', 'Server added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MikrotikServer $mikrotikServer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MikrotikServer $mikrotikServer)
    {
        return Inertia::render('settings/mikrotik-servers/edit', [
            'mikrotikServer' => $mikrotikServer,
            'coverages' => Coverage::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MikrotikServer $mikrotikServer)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'boolean',
            'coverage_id' => 'required|exists:coverages,id',
        ]);

        $mikrotikServer->update($request->all());

        return redirect()->route('mikrotik-servers.index')->with('success', 'Server updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MikrotikServer $mikrotikServer)
    {
        $mikrotikServer->delete();

        return redirect()->route('mikrotik-servers.index')->with('success', 'Server deleted successfully.');
    }
}