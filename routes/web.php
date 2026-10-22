<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('users', UserController::class);

    Route::post('leads/{id}/restore', [LeadController::class, 'restore'])->name('leads.restore');
    Route::post('leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');
    Route::resource('leads', LeadController::class);

    Route::post('clients/{id}/restore', [ClientController::class, 'restore'])->name('clients.restore');
    Route::resource('clients', ClientController::class);
    Route::post('clients/{client}/contacts', [ContactController::class, 'store'])->name('clients.contacts.store');
    Route::put('contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::post('contacts/{contact}/make-primary', [ContactController::class, 'makePrimary'])->name('contacts.make-primary');

    Route::post('deals/{id}/restore', [DealController::class, 'restore'])->name('deals.restore');
    Route::patch('deals/{deal}/stage', [DealController::class, 'updateStage'])->name('deals.stage');
    Route::resource('deals', DealController::class);

    Route::post('activities/{id}/restore', [ActivityController::class, 'restore'])->name('activities.restore');
    Route::patch('activities/{activity}/complete', [ActivityController::class, 'complete'])->name('activities.complete');
    Route::resource('activities', ActivityController::class);
});

require __DIR__.'/settings.php';
