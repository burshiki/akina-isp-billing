<?php

namespace App\Http\Controllers;

use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InternetPackageController extends Controller
{
    public function index()
    {
        $packages = InternetPackage::latest()->get();
        return Inertia::render('plans/index', [
            'packages' => $packages
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|in:fiber,wireless',
            'status' => 'required|in:active,inactive',
            'remarks' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('package-images', 'public');
            $validated['image_path'] = $path;
        }

        InternetPackage::create($validated);

        return redirect()->back()->with('success', 'Package created successfully.');
    }

    public function update(Request $request, InternetPackage $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|in:fiber,wireless',
            'status' => 'required|in:active,inactive',
            'remarks' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($package->image_path) {
                Storage::disk('public')->delete($package->image_path);
            }
            $path = $request->file('image')->store('package-images', 'public');
            $validated['image_path'] = $path;
        }

        $package->update($validated);

        return redirect()->back()->with('success', 'Package updated successfully.');
    }

    public function destroy(InternetPackage $package)
    {
        if ($package->image_path) {
            Storage::disk('public')->delete($package->image_path);
        }
        
        $package->delete();

        return redirect()->back()->with('success', 'Package deleted successfully.');
    }
} 