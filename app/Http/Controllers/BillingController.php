<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BillingController extends Controller
{
    public function index()
    {
        $customers = Customer::query()
            ->select([
                'customers.id',
                'customers.name',
                'customers.payment_type',
                'customers.due_date',
                'customers.activation_date',
                'internet_packages.name as plan_name',
                'internet_packages.price as plan_price',
            ])
            ->join('internet_packages', 'internet_packages.id', '=', 'customers.plan_id')
            ->where('customers.status', 'active')
            ->get();

        $invoices = Invoice::query()
            ->select([
                'invoices.id',
                'invoices.invoice_no',
                'customers.name as customer_name',
                'internet_packages.name as plan_name',
                'invoices.amount',
                'invoices.status',
                'invoices.due_date',
                'invoices.customer_id',
                'invoices.start_date',
                'invoices.end_date',
                'invoices.billing_type',
            ])
            ->join('customers', 'customers.id', '=', 'invoices.customer_id')
            ->join('internet_packages', 'internet_packages.id', '=', 'customers.plan_id')
            ->orderBy('invoices.created_at', 'desc')
            ->get();

        return Inertia::render('billing/index', [
            'customers' => $customers,
            'invoices' => $invoices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'billing_type' => 'required|in:full,prorated',
            'remarks' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ]);

        // Get customer and plan details
        $customer = Customer::with('internetPackage')->findOrFail($validated['customer_id']);

        // Calculate start_date and end_date based on customer's due_date for full billing
        if ($validated['billing_type'] === 'full' && $customer->payment_type === 'postpaid' && $customer->due_date) {
            $currentDate = Carbon::now();
            $customerDueDay = $customer->due_date;

            // Determine the end_date for the current billing period
            $calculatedEndDate = Carbon::createFromDate($currentDate->year, $currentDate->month, $customerDueDay);

            // If the calculated end date is in the past, move it to the next month
            if ($calculatedEndDate->isPast() && $currentDate->day > $customerDueDay) {
                $calculatedEndDate->addMonthNoOverflow();
            }

            $validated['end_date'] = $calculatedEndDate->format('Y-m-d');
            $validated['start_date'] = $calculatedEndDate->copy()->subMonthNoOverflow()->addDay()->format('Y-m-d');
        } else {
            // For prorated or prepaid, use dates from the request (or default to current month if not provided)
            $validated['start_date'] = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
            $validated['end_date'] = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        }

        // Check for existing invoices for the same customer and overlapping billing period
        $existingInvoice = Invoice::where('customer_id', $validated['customer_id'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                      ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                      ->orWhere(function ($query) use ($validated) {
                          $query->where('start_date', '<=', $validated['start_date'])
                                ->where('end_date', '>=', $validated['end_date']);
                      });
            })
            ->first();

        if ($existingInvoice) {
            return redirect()->back()->withErrors([
                'customer_id' => 'An invoice for this customer already exists for the selected billing period.'
            ]);
        }

        // Generate invoice number (INV-YYYYMM-XXXX)
        $latestInvoice = Invoice::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->latest()
            ->first();

        $sequence = $latestInvoice 
            ? (int)substr($latestInvoice->invoice_no, -4) + 1 
            : 1;

        $invoiceNo = sprintf(
            'INV-%s%s-%04d',
            now()->format('Y'),
            now()->format('m'),
            $sequence
        );

        // Use the amount passed from the frontend
        $amount = $validated['amount'];

        $invoice = Invoice::create([
            'invoice_no' => $invoiceNo,
            'customer_id' => $validated['customer_id'],
            'billing_type' => $validated['billing_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'amount' => $amount,
            'status' => 'pending',
            'due_date' => $this->calculateDueDate($customer, $validated['end_date'], $validated['billing_type']),
            'remarks' => $validated['remarks'],
        ]);

        return Inertia::location(route('billing.index'));
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->back();
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        

        $invoice->update($validated);

        return Inertia::location(route('billing.index'));
    }

    private function calculateProratedAmount(float $monthlyPrice, string $startDate, string $endDate): float
    {
        $start = new \DateTime($startDate);
        $end = new \DateTime($endDate);
        $daysInMonth = (int)$start->format('t'); // Get number of days in the month
        $days = $end->diff($start)->days + 1; // Add 1 to include both start and end dates

        return round(($monthlyPrice / $daysInMonth) * $days, 2);
    }

    private function calculateDueDate(Customer $customer, string $endDate, string $billingType): string
    {
        if ($billingType === 'prorated') {
            return Carbon::parse($endDate)->format('Y-m-d');
        }

        if ($customer->payment_type === 'postpaid' && $customer->due_date) {
            $billingEndDate = Carbon::parse($endDate);
            $customerDueDay = $customer->due_date;

            // Attempt to set the due date in the current month of the billing period end
            $calculatedDueDate = Carbon::createFromDate(
                $billingEndDate->year,
                $billingEndDate->month,
                $customerDueDay
            );

            // If the calculated due date is after the billing end date, it means the due date for this billing period
            // should be in the next month relative to the billing end date.
            if ($calculatedDueDate->greaterThan($billingEndDate)) {
                return $calculatedDueDate->format('Y-m-d');
            } else {
                // If the calculated due date is on or before the billing end date,
                // it means the due date for this billing period is in the current month.
                return $calculatedDueDate->format('Y-m-d');
            }
        }

        // For prepaid or if no due date set, due immediately (current day)
        return now()->format('Y-m-d');
    }
}