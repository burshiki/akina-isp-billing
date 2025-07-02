<?php

use App\Http\Controllers\InternetPackageController;
use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => inertia('dashboard'))->name('dashboard');
    Route::get('/plans', [InternetPackageController::class, 'index'])->name('plans.index');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    Route::post('plans', [InternetPackageController::class, 'store'])->name('plans.store');
    Route::put('plans/{package}', [InternetPackageController::class, 'update'])->name('plans.update');
    Route::delete('plans/{package}', [InternetPackageController::class, 'destroy'])->name('plans.destroy');

    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
