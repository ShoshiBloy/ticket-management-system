<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    public function test_ticket_can_be_created(): void
    {
        $response = $this->postJson('/api/tickets', [
            'title' => 'Test ticket',
            'description' => 'This is a test ticket',
            'priority' => TicketPriority::HIGH->value,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Test ticket')
            ->assertJsonPath('data.status', TicketStatus::OPEN->value)
            ->assertJsonPath('data.priority', TicketPriority::HIGH->value);

        $this->assertDatabaseHas('tickets', [
            'title' => 'Test ticket',
            'status' => TicketStatus::OPEN->value,
            'priority' => TicketPriority::HIGH->value,
        ]);
    }

    public function test_ticket_cannot_be_closed_without_assigned_user(): void
    {
        $ticket = Ticket::create([
            'title' => 'Unassigned ticket',
            'description' => 'Ticket without assigned user',
            'status' => TicketStatus::OPEN->value,
            'priority' => TicketPriority::MEDIUM->value,
            'assigned_user_id' => null,
        ]);

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::CLOSED->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['assigned_user_id']);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::OPEN->value,
            'assigned_user_id' => null,
        ]);
    }

    public function test_ticket_can_be_closed_after_assignment(): void
    {
        $user = User::factory()->create();

        $ticket = Ticket::create([
            'title' => 'Assigned ticket',
            'description' => 'Ticket assigned to user',
            'status' => TicketStatus::OPEN->value,
            'priority' => TicketPriority::MEDIUM->value,
            'assigned_user_id' => $user->id,
        ]);

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::CLOSED->value,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', TicketStatus::CLOSED->value);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::CLOSED->value,
            'assigned_user_id' => $user->id,
        ]);
    }

    public function test_stale_high_priority_ticket_is_reopened_by_command(): void
    {
        $ticket = Ticket::create([
            'title' => 'Stale high priority ticket',
            'description' => 'Old ticket in progress',
            'status' => TicketStatus::IN_PROGRESS->value,
            'priority' => TicketPriority::HIGH->value,
            'handled_at' => now()->subHours(49),
            'created_at' => now()->subHours(50),
            'updated_at' => now()->subHours(49),
        ]);

        $this->artisan('tickets:reopen-stale-high-priority')
            ->assertExitCode(0);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::OPEN->value,
            'priority' => TicketPriority::HIGH->value,
        ]);
    }
}
