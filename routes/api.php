<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TicketController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('tickets/open',[TicketController::class,'openTickets']);

Route::apiResource('tickets',TicketController::class);

Route::patch('tickets/{ticket}/status',[TicketController::class,'changeStatus']);
Route::patch('tickets/{ticket}/assign',[TicketController::class,'assign']);
