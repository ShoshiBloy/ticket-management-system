<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Validation\ValidationException;

class TicketService
{
    public function create(array $data): Ticket
    {
        $data['status'] = $data['status'] ?? TicketStatus::OPEN->value;

        if (($data['status'] ?? null) === TicketStatus::IN_PROGRESS->value) {
            $data['handled_at'] = now();
        }

        return Ticket::create($data);
    }

    public function update(Ticket $ticket, array $data): Ticket
    {
        if (isset($data['status'])) {
            $this->validateStatusChange(
                $ticket,
                $data['status'],
                $data['assigned_user_id'] ?? null
            );
            if ($data['status'] === TicketStatus::IN_PROGRESS->value) {
                $data['handled_at'] = now();
            }
        }

        $ticket->update($data);

        return $ticket->refresh();
    }

    public function changeStatus(Ticket $ticket, string $status): Ticket
    {
        $this->validateStatusChange($ticket, $status);

        $data = ['status' => $status];

        if ($status === TicketStatus::IN_PROGRESS->value) {
            $data['handled_at'] = now();
        }

        $ticket->update($data);

        return $ticket->refresh();
    }

    public function assign(Ticket $ticket, int $userId): Ticket
    {
        $ticket->update([
            'assigned_user_id' => $userId,
        ]);

        return $ticket->refresh();
    }

    private function validateStatusChange(Ticket $ticket, string $status, ?int $assignedUserId = null): void
    {
        $hasAssignedUser = $assignedUserId ?? $ticket->assigned_user_id;

        if ($status === TicketStatus::CLOSED->value && !$hasAssignedUser) {
            throw ValidationException::withMessages([
                'assigned_user_id' => 'Ticket must be assigned to a user before it can be closed.',
            ]);
        }
    }
}
