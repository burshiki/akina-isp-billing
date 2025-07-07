<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Coverage extends Model
{
    use HasFactory;

    protected $table = 'coverages';

    protected $fillable = [
        'area_code',
        'name',
        'address',
        'remarks',
    ];

    protected $appends = ['total_customers'];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function mikrotikServers(): BelongsToMany
    {
        return $this->belongsToMany(MikrotikServer::class, 'coverage_mikrotik_integrations')
            ->withPivot('description', 'is_active')
            ->withTimestamps();
    }

    public function getTotalCustomersAttribute(): int
    {
        return $this->customers()->count();
    }
} 