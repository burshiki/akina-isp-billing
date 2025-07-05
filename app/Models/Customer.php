<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_no',
        'name',
        'email',
        'password',
        'phone',
        'address',
        'customer_type',
        'id_card_type',
        'id_number',
        'remarks',
        'plan_id',
        'status',
        'payment_type',
        'due_date',
        'is_tax_active',
        'coverage_id',
        'activation_date',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_tax_active' => 'boolean',
        'activation_date' => 'date',
        'due_date' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            // Generate account number (format: AKINA-YYYYMMDD-XXXX)
            $latestCustomer = static::latest()->first();
            $sequence = $latestCustomer ? (intval(substr($latestCustomer->account_no, -4)) + 1) : 1;
            $customer->account_no = 'AKINA-' . date('Ymd') . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Set default password if not provided
            if (!$customer->password) {
                $customer->password = Hash::make('1234');
            }
        });
    }

    public function internetPackage(): BelongsTo
    {
        return $this->belongsTo(InternetPackage::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(InternetPackage::class, 'plan_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function coverage(): BelongsTo
    {
        return $this->belongsTo(Coverage::class);
    }
}
