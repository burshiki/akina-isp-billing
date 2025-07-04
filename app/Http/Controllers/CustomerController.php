<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Coverage;
use App\Models\InternetPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('customers/index', [
            'customers' => Customer::with(['internetPackage', 'coverage'])->get()->map(function ($customer) {
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
                    'plan_id' => $customer->internet_package_id,
                    'plan_name' => $customer->internetPackage?->name,
                    'status' => $customer->status,
                    'payment_type' => $customer->payment_type,
                    'due_date' => $customer->due_date,
                    'is_tax_active' => $customer->is_tax_active,
                    'created_at' => $customer->created_at->format('Y-m-d'),
                    'coverage_id' => $customer->coverage_id,
                    'coverage_name' => $customer->coverage?->name,
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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers',
            'phone' => 'required|string|max:20',
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
        ]);

        Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'customer_type' => $validated['customer_type'],
            'id_card_type' => $validated['id_card_type'],
            'id_number' => $validated['id_number'],
            'remarks' => $validated['remarks'],
            'internet_package_id' => $validated['plan_id'],
            'status' => $validated['status'],
            'payment_type' => $validated['payment_type'],
            'due_date' => $validated['due_date'],
            'is_tax_active' => $validated['is_tax_active'],
            'coverage_id' => $validated['coverage_id'],
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email,' . $customer->id,
            'phone' => 'required|string|max:20',
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
        ]);

        $customer->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'customer_type' => $validated['customer_type'],
            'id_card_type' => $validated['id_card_type'],
            'id_number' => $validated['id_number'],
            'remarks' => $validated['remarks'],
            'internet_package_id' => $validated['plan_id'],
            'status' => $validated['status'],
            'payment_type' => $validated['payment_type'],
            'due_date' => $validated['due_date'],
            'is_tax_active' => $validated['is_tax_active'],
            'coverage_id' => $validated['coverage_id'],
        ]);

        return redirect()->back();
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back();
    }
}
