<?php

use App\Http\Controllers\Settings\IntegrationController;
use App\Http\Controllers\Settings\MikrotikServerController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/mikrotik-servers', [MikrotikServerController::class, 'index'])->name('mikrotik-servers.index');
    Route::post('settings/mikrotik-servers', [MikrotikServerController::class, 'store'])->name('mikrotik-servers.store');
    Route::put('settings/mikrotik-servers/{mikrotikServer}', [MikrotikServerController::class, 'update'])->name('mikrotik-servers.update');
    Route::delete('settings/mikrotik-servers/{mikrotikServer}', [MikrotikServerController::class, 'destroy'])->name('mikrotik-servers.destroy');

    // Integration routes
    Route::get('/integrations', [IntegrationController::class, 'index'])->name('integrations.index');
    Route::post('/integrations', [IntegrationController::class, 'store'])->name('integrations.store');
    Route::put('/integrations/{coverage}/{mikrotikServer}', [IntegrationController::class, 'update'])->name('integrations.update');
    Route::delete('/integrations/{coverage}/{mikrotikServer}', [IntegrationController::class, 'destroy'])->name('integrations.destroy');
});
