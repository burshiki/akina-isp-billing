<?php

use App\Http\Controllers\InternetPackageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('plans', [InternetPackageController::class, 'index'])->name('plans.index');
    Route::post('plans', [InternetPackageController::class, 'store'])->name('plans.store');
    Route::put('plans/{package}', [InternetPackageController::class, 'update'])->name('plans.update');
    Route::delete('plans/{package}', [InternetPackageController::class, 'destroy'])->name('plans.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
