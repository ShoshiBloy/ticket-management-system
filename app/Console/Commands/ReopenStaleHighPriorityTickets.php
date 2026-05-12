<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;

#[Signature('tickets:reopen-stale-high-priority')]
#[Description('Reopen high priority tickets that were not handled for more than 48 hours.')]
class ReopenStaleHighPriorityTickets extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $affectedRows = Ticket::query()
            ->where('priority', TicketPriority::HIGH->value)
            ->where('status', TicketStatus::IN_PROGRESS->value)
            ->whereNotNull('handled_at')
            ->where('handled_at', '<=', now()->subHours(48))
            ->update([
                'status' => TicketStatus::OPEN->value,
                'updated_at' => now(),
            ]);

        $this->info("Reopened {$affectedRows} stale high priority tickets.");

        return self::SUCCESS;
    }
}
