<?php

namespace App\Http\Controllers;

use App\Models\Coverage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoverageController extends Controller
{
    public function index()
    {
        return Inertia::render('coverage/index', [
            'areas' => Coverage::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'area_code' => 'required|string|max:255|unique:coverages',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        Coverage::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Coverage $coverage)
    {
        $validated = $request->validate([
            'area_code' => 'required|string|max:255|unique:coverages,area_code,' . $coverage->id,
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        $coverage->update($validated);

        return redirect()->back();
    }

    public function destroy(Coverage $coverage)
    {
        $coverage->delete();

        return redirect()->back();
    }
} 