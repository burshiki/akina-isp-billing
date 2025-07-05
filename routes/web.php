<?php

use App\Http\Controllers\InternetPackageController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CoverageController;
use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return redirect('/dashboard');
    });

    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/plans', [InternetPackageController::class, 'index'])->name('plans.index');
    Route::get('/coverage', [CoverageController::class, 'index'])->name('coverage.index');
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing', [BillingController::class, 'store'])->name('billing.store');
    Route::put('/billing/{invoice}', [BillingController::class, 'update'])->name('billing.update');
    Route::delete('/billing/{invoice}', [BillingController::class, 'destroy'])->name('billing.destroy');
    Route::delete('/billing/{invoice}', [BillingController::class, 'destroy'])->name('billing.destroy');

    Route::post('plans', [InternetPackageController::class, 'store'])->name('plans.store');
    Route::put('plans/{package}', [InternetPackageController::class, 'update'])->name('plans.update');
    Route::delete('plans/{package}', [InternetPackageController::class, 'destroy'])->name('plans.destroy');

    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::post('customers/{customer}/sync', [CustomerController::class, 'syncToMikrotik'])->name('customers.sync');

    Route::post('/coverage', [CoverageController::class, 'store'])->name('coverage.store');
    Route::put('/coverage/{coverage}', [CoverageController::class, 'update'])->name('coverage.update');
    Route::delete('/coverage/{coverage}', [CoverageController::class, 'destroy'])->name('coverage.destroy');

    Route::prefix('settings')->name('settings.')->group(function () {
        // ... existing code ...
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
