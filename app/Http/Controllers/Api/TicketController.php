<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTicketRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function __construct(
        private readonly TicketService $ticketService
    ) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(TicketStatus::values())],
            'priority' => ['nullable', Rule::in(TicketPriority::values())],
            'assigned_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'sort_by' => ['nullable', 'in:created_at,priority,status'],
            'sort_direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Ticket::query()
            ->with('assignedUser')
            ->status($validated['status'] ?? null)
            ->priority($validated['priority'] ?? null)
            ->assignedTo($validated['assigned_user_id'] ?? null);

        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDirection = $validated['sort_direction'] ?? 'desc';

        if ($sortBy === 'priority') {
            $priorityOrder = $sortDirection === 'desc'
                ? "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END"
                : "CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 ELSE 4 END";

            $query->orderByRaw($priorityOrder);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $tickets = $query->paginate($validated['per_page'] ?? 10);

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = $this->ticketService->create($request->validated());

        return response()->json([
            'message' => 'Ticket created successfully.',
            'data' => new TicketResource($ticket->load('assignedUser')),
        ], 201);
    }

    public function show(Ticket $ticket): TicketResource
    {
        return new TicketResource($ticket->load('assignedUser'));
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->update($ticket, $request->validated());

        return response()->json([
            'message' => 'Ticket updated successfully.',
            'data' => new TicketResource($ticket->load('assignedUser')),
        ]);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully.',
        ]);
    }

    public function changeStatus(UpdateTicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->changeStatus($ticket, $request->validated('status'));

        return response()->json([
            'message' => 'Ticket status updated successfully.',
            'data' => new TicketResource($ticket->load('assignedUser')),
        ]);
    }

    public function assign(AssignTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->assign($ticket, (int)$request->validated('assigned_user_id'));

        return response()->json([
            'message' => 'Ticket assigned successfully.',
            'data' => new TicketResource($ticket->load('assignedUser')),
        ]);
    }

    public function openTickets()
    {
        $tickets = Ticket::query()
            ->with('assignedUser')
            ->open()
            ->latest()
            ->paginate(10);

        return TicketResource::collection($tickets);
    }
}
