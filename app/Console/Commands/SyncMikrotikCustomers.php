<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Services\MikrotikService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SyncMikrotikCustomers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:sync-customers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync customers to MikroTik PPPoE secrets and disable unpaid customers.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $mikrotikService = new MikrotikService();
        } catch (\Exception $e) {
            $this->error($e->getMessage());
            Log::error($e->getMessage());
            return;
        }

        $customers = Customer::with(['invoices', 'plan'])->get();

        foreach ($customers as $customer) {
            $this->info("Processing customer: {$customer->name}");

            $shouldBeDisabled = false;
            foreach ($customer->invoices as $invoice) {
                Log::info("Invoice for {$customer->name}: ID {$invoice->id}, Status: {$invoice->status}, Due Date: {$invoice->due_date}");
                if ($invoice->status === 'pending' && Carbon::parse($invoice->due_date)->isPast()) {
                    $shouldBeDisabled = true;
                    break;
                }
            }

            if ($shouldBeDisabled) {
                if ($mikrotikService->secretExists($customer->name)) {
                    $mikrotikService->disableSecret($customer->name);
                    $this->warn("Disabled PPPoE secret for {$customer->name} due to overdue pending invoice.");
                }
            } else {
                $mikrotikService->createOrEnableSecret($customer);
                $this->info("Created/Enabled and synced PPPoE secret for {$customer->name}.");
            }
        }

        $this->info('Customer synchronization complete.');
    }
}
