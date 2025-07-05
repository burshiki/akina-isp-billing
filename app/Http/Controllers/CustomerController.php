<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Coverage;
use App\Models\InternetPackage;
use App\Services\MikrotikService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function syncToMikrotik(Customer $customer, MikrotikService $mikrotikService)
    {
        Log::info("Attempting to sync customer to MikroTik: ID {$customer->id}, Name: {$customer->name}");
        try {
            $mikrotikService->createOrEnableSecret($customer);
            Log::info("Customer synced to MikroTik successfully: ID {$customer->id}");
            return redirect()->back()->with('success', 'Customer synced to MikroTik successfully.');
        } catch (\Exception $e) {
            Log::error("Failed to sync customer to MikroTik: ID {$customer->id}, Error: {$e->getMessage()}");
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function index()
    {
        return Inertia::render('customers/index', [
            'customers' => Customer::with(['plan', 'coverage'])->get()->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'account_no' => $customer->account_no,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'address' => $customer->address,
                    'customer_type' => $customer->customer_type,
                    'id_card_type' => $customer->id_card_type,
                    'id_number' => $customer->id_number,
                    'remarks' => $customer->remarks,
                    'plan_id' => $customer->plan_id,
                    'plan_name' => $customer->plan?->name,
                    'status' => $customer->status,
                    'payment_type' => $customer->payment_type,
                    'due_date' => $customer->due_date,
                    'is_tax_active' => $customer->is_tax_active,
                    'created_at' => $customer->created_at->format('Y-m-d'),
                    'coverage_id' => $customer->coverage_id,
                    'coverage_name' => $customer->coverage?->name,
                    'activation_date' => $customer->activation_date->format('Y-m-d'),
                ];
            }),
            'plans' => InternetPackage::where('status', 'active')->get()->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                ];
            }),
            'coverages' => Coverage::orderBy('area_code')->get()->map(function ($coverage) {
                return [
                    'id' => $coverage->id,
                    'area_code' => $coverage->area_code,
                    'name' => $coverage->name,
                ];
            }),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'customer_type' => 'required|in:public,corporate,government',
            'id_card_type' => 'required|in:umid,sss,sim,passport,pag-ibig',
            'id_number' => 'required|string|max:255',
            'remarks' => 'nullable|string',
            'plan_id' => 'required|exists:internet_packages,id',
            'status' => 'required|in:active,inactive',
            'payment_type' => 'required|in:postpaid,prepaid',
            'due_date' => 'required_if:payment_type,postpaid|nullable|integer|min:1|max:31',
            'is_tax_active' => 'required|boolean',
            'coverage_id' => 'required|exists:coverages,id',
            'activation_date' => 'required|date',
        ]);

        // Generate account number (ACC-YYYYMM-XXXX)
        $latestCustomer = Customer::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->latest()
            ->first();

        $sequence = $latestCustomer 
            ? (int)substr($latestCustomer->account_no, -4) + 1 
            : 1;

        $accountNo = sprintf(
            'ACC-%s%s-%04d',
            now()->format('Y'),
            now()->format('m'),
            $sequence
        );

        $customer = Customer::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'customer_type' => 'required|in:public,corporate,government',
            'id_card_type' => 'required|in:umid,sss,sim,passport,pag-ibig',
            'id_number' => 'required|string|max:255',
            'remarks' => 'nullable|string',
            'plan_id' => 'required|exists:internet_packages,id',
            'status' => 'required|in:active,inactive',
            'payment_type' => 'required|in:postpaid,prepaid',
            'due_date' => 'required_if:payment_type,postpaid|nullable|integer|min:1|max:31',
            'is_tax_active' => 'required|boolean',
            'coverage_id' => 'required|exists:coverages,id',
            'activation_date' => 'required|date',
        ]);

        $customer->update($validated);

        return redirect()->back();
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back();
    }
}
