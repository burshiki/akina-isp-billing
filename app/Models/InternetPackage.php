<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InternetPackage extends Model
{
    protected $fillable = [
        'name',
        'price',
        'category',
        'status',
        'remarks',
        'image_path',
        'mikrotik_profile',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];
} 