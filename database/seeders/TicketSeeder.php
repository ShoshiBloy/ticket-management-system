<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first();

        Ticket::updateOrCreate(
            ['title' => 'Open high priority ticket'],
            [
                'description' => 'Example high priority open ticket.',
                'status' => TicketStatus::OPEN->value,
                'priority' => TicketPriority::HIGH->value,
                'assigned_user_id' => null,
                'handled_at' => null,
            ]
        );

        Ticket::updateOrCreate(
            ['title' => 'In progress medium ticket'],
            [
                'description' => 'Example ticket currently in progress.',
                'status' => TicketStatus::IN_PROGRESS->value,
                'priority' => TicketPriority::MEDIUM->value,
                'assigned_user_id' => $user?->id,
                'handled_at' => now(),
            ]
        );

        Ticket::updateOrCreate(
            ['title' => 'Closed low priority ticket'],
            [
                'description' => 'Example closed ticket assigned to a user.',
                'status' => TicketStatus::CLOSED->value,
                'priority' => TicketPriority::LOW->value,
                'assigned_user_id' => $user?->id,
                'handled_at' => now()->subHours(5),
            ]
        );

        Ticket::updateOrCreate(
            ['title' => 'Stale high priority ticket'],
            [
                'description' => 'Example stale high priority ticket for scheduler testing.',
                'status' => TicketStatus::IN_PROGRESS->value,
                'priority' => TicketPriority::HIGH->value,
                'assigned_user_id' => $user?->id,
                'handled_at' => now()->subHours(49),
                'created_at' => now()->subHours(50),
                'updated_at' => now()->subHours(49),
            ]
        );
    }
}
