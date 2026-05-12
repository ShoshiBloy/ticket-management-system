<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('users',[UserController::class,'index']);

Route::get('tickets/open',[TicketController::class,'openTickets']);
Route::get('tickets/stats', [TicketController::class, 'stats']);

Route::apiResource('tickets',TicketController::class);

Route::patch('tickets/{ticket}/status',[TicketController::class,'changeStatus']);
Route::patch('tickets/{ticket}/assign',[TicketController::class,'assign']);

