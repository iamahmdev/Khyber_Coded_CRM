<?php

namespace App\Models;

use App\Enums\ActivityPriority;
use App\Enums\ActivityStatus;
use App\Enums\ActivityType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'type',
        'status',
        'priority',
        'due_at',
        'completed_at',
        'lead_id',
        'client_id',
        'deal_id',
        'assigned_to',
        'created_by',
        'location',
        'notes',
        'outcome',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ActivityType::class,
            'status' => ActivityStatus::class,
            'priority' => ActivityPriority::class,
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Associated lead record, if linked.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Associated client organization, if linked.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Associated sales deal/opportunity, if linked.
     */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    /**
     * Team member assigned to perform this activity.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * User who logged or scheduled this activity.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope query to activities accessible to the user.
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        if ($user->isAdmin() || $user->isManager()) {
            return $query;
        }

        if ($user->isStaff()) {
            return $query->where(function (Builder $q) use ($user) {
                $q->where('assigned_to', $user->id)
                    ->orWhere('created_by', $user->id);
            });
        }

        // Client portal users see only activities linked to their client
        return $query->where('client_id', $user->client_id ?? 0);
    }

    /**
     * Scope query for pending activities.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', ActivityStatus::Pending->value);
    }

    /**
     * Scope query for completed activities.
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', ActivityStatus::Completed->value);
    }

    /**
     * Scope query for overdue activities (pending with due date in the past).
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', ActivityStatus::Pending->value)
            ->where('due_at', '<', now());
    }

    /**
     * Scope query for upcoming activities (pending with due date now or future).
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('status', ActivityStatus::Pending->value)
            ->where('due_at', '>=', now());
    }

    /**
     * Scope query for activities scheduled for today.
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('due_at', today());
    }

    /**
     * Scope query by search term across title, location, notes, and outcome.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (blank($search)) {
            return $query;
        }

        $term = trim($search);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('location', 'like', "%{$term}%")
                ->orWhere('notes', 'like', "%{$term}%")
                ->orWhere('outcome', 'like', "%{$term}%")
                ->orWhereHas('client', function (Builder $cq) use ($term) {
                    $cq->where('name', 'like', "%{$term}%");
                })
                ->orWhereHas('lead', function (Builder $lq) use ($term) {
                    $lq->where('name', 'like', "%{$term}%");
                })
                ->orWhereHas('deal', function (Builder $dq) use ($term) {
                    $dq->where('title', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope query by activity type.
     */
    public function scopeType(Builder $query, ?string $type): Builder
    {
        if (blank($type) || $type === 'all') {
            return $query;
        }

        return $query->where('type', $type);
    }

    /**
     * Scope query by status.
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        if (blank($status) || $status === 'all') {
            return $query;
        }

        if ($status === 'overdue') {
            return $this->scopeOverdue($query);
        }

        return $query->where('status', $status);
    }

    /**
     * Scope query by priority.
     */
    public function scopePriority(Builder $query, ?string $priority): Builder
    {
        if (blank($priority) || $priority === 'all') {
            return $query;
        }

        return $query->where('priority', $priority);
    }

    /**
     * Scope query by assigned user.
     */
    public function scopeAssignee(Builder $query, ?int $userId): Builder
    {
        if (empty($userId)) {
            return $query;
        }

        return $query->where('assigned_to', $userId);
    }

    /**
     * Check if activity is currently overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === ActivityStatus::Pending && $this->due_at->isPast();
    }

    /**
     * Mark the activity as completed.
     */
    public function markCompleted(?string $outcome = null): void
    {
        $this->update([
            'status' => ActivityStatus::Completed,
            'completed_at' => now(),
            'outcome' => $outcome ?: $this->outcome,
        ]);
    }

    /**
     * Mark the activity as cancelled.
     */
    public function markCancelled(?string $outcome = null): void
    {
        $this->update([
            'status' => ActivityStatus::Cancelled,
            'completed_at' => null,
            'outcome' => $outcome ?: $this->outcome,
        ]);
    }
}
