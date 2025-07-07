<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MikrotikServer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ip_address',
        'coverage_id',
    ];

    public function coverage()
    {
        return $this->belongsTo(Coverage::class);
    }
}