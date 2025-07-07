<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MikrotikServer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'host',
        'username',
        'password',
        'port',
        'is_active',
        'coverage_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function coverage(): BelongsTo
    {
        return $this->belongsTo(Coverage::class);
    }

    public function coverages(): BelongsToMany
    {
        return $this->belongsToMany(Coverage::class, 'coverage_mikrotik_integrations')
            ->withPivot('description', 'is_active')
            ->withTimestamps();
    }
}