<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'assigned_user_id',
        'handled_at',
    ];

    protected $casts = [
        'handled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return $query->when($status, fn(Builder $q) => $q->where('status', $status));
    }

    public function scopePriority(Builder $query, ?string $priority): Builder
    {
        return $query->when($priority, fn(Builder $q) => $q->where('priority', $priority));
    }

    public function scopeAssignedTo(Builder $query, ?int $userId): Builder
    {
        return $query->when($userId, fn(Builder $q) => $q->where('assigned_user_id', $userId));
    }

    public function isClosed(): bool
    {
        return $this->status === TicketStatus::CLOSED->value;
    }

    public function isHighPriority(): bool
    {
        return $this->priority === TicketPriority::HIGH->value;
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', TicketStatus::OPEN->value);
    }

    public function scopeApplySorting(Builder $query, ?string $sortBy = null, ?string $sortDirection = null): Builder
    {
        $sortBy = $sortBy ?: 'created_at';
        $sortDirection = $sortDirection ?: 'desc';

        if ($sortBy === 'priority') {
            $priorityOrder = $sortDirection === 'desc'
                ? "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END"
                : "CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 ELSE 4 END";

            return $query->orderByRaw($priorityOrder);
        }

        if ($sortBy === 'status') {
            $statusOrder = $sortDirection === 'desc'
                ? "CASE status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'closed' THEN 3 ELSE 4 END"
                : "CASE status WHEN 'closed' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'open' THEN 3 ELSE 4 END";

            return $query->orderByRaw($statusOrder);
        }

        return $query->orderBy($sortBy, $sortDirection);
    }
}
