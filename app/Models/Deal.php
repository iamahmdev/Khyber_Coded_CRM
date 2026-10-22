<?php

namespace App\Models;

use App\Enums\DealPriority;
use App\Enums\DealStage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deal extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'client_id',
        'lead_id',
        'contact_id',
        'assigned_to',
        'created_by',
        'stage',
        'priority',
        'amount',
        'currency',
        'probability',
        'expected_close_date',
        'actual_close_date',
        'loss_reason',
        'notes',
        'stage_updated_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stage' => DealStage::class,
            'priority' => DealPriority::class,
            'amount' => 'decimal:2',
            'probability' => 'integer',
            'expected_close_date' => 'date',
            'actual_close_date' => 'date',
            'stage_updated_at' => 'datetime',
        ];
    }

    /**
     * Client organization associated with this deal.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Lead origin associated with this deal.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Specific contact person for this deal.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Team member assigned to manage this deal.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * User who created the deal record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Historical stage transition records for this deal.
     */
    public function stageHistories(): HasMany
    {
        return $this->hasMany(DealStageHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scope query to deals accessible by the given user.
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

        // Client portal users see only deals for their linked client
        return $query->where('client_id', $user->client_id ?? 0);
    }

    /**
     * Scope query to search by deal title or associated client/contact name.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (blank($search)) {
            return $query;
        }

        $term = trim($search);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhereHas('client', function (Builder $clientQuery) use ($term) {
                    $clientQuery->where('name', 'like', "%{$term}%");
                })
                ->orWhereHas('contact', function (Builder $contactQuery) use ($term) {
                    $contactQuery->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope query to filter by stage.
     */
    public function scopeStage(Builder $query, ?string $stage): Builder
    {
        if (blank($stage) || $stage === 'all') {
            return $query;
        }

        return $query->where('stage', $stage);
    }

    /**
     * Scope query to filter by priority.
     */
    public function scopePriority(Builder $query, ?string $priority): Builder
    {
        if (blank($priority) || $priority === 'all') {
            return $query;
        }

        return $query->where('priority', $priority);
    }

    /**
     * Scope query to filter by assigned account manager.
     */
    public function scopeAssignee(Builder $query, ?int $userId): Builder
    {
        if (empty($userId)) {
            return $query;
        }

        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope query to filter by client.
     */
    public function scopeClient(Builder $query, ?int $clientId): Builder
    {
        if (empty($clientId)) {
            return $query;
        }

        return $query->where('client_id', $clientId);
    }

    /**
     * Scope query to open (active) deals.
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereNotIn('stage', [DealStage::Won->value, DealStage::Lost->value]);
    }

    /**
     * Transition the deal to a new stage, recording history and updating timestamps.
     */
    public function transitionToStage(
        DealStage|string $newStage,
        ?User $user = null,
        ?string $lossReason = null,
        ?string $notes = null
    ): void {
        $stageEnum = is_string($newStage) ? DealStage::from($newStage) : $newStage;
        $previousStage = $this->stage instanceof DealStage ? $this->stage->value : (string) $this->stage;

        if ($previousStage === $stageEnum->value) {
            return;
        }

        $updates = [
            'stage' => $stageEnum,
            'stage_updated_at' => now(),
            'probability' => $stageEnum->defaultProbability(),
        ];

        if ($stageEnum === DealStage::Won) {
            $updates['actual_close_date'] = now()->toDateString();
            $updates['loss_reason'] = null;
        } elseif ($stageEnum === DealStage::Lost) {
            $updates['actual_close_date'] = now()->toDateString();
            if ($lossReason) {
                $updates['loss_reason'] = $lossReason;
            }
        } else {
            $updates['actual_close_date'] = null;
            $updates['loss_reason'] = null;
        }

        $this->update($updates);

        $this->stageHistories()->create([
            'user_id' => $user?->id,
            'from_stage' => $previousStage,
            'to_stage' => $stageEnum->value,
            'notes' => $notes ?: ($stageEnum === DealStage::Lost && $lossReason ? "Marked as lost: {$lossReason}" : null),
        ]);
    }

    /**
     * Calculate the probability-weighted value of this deal.
     */
    public function getWeightedAmountAttribute(): float
    {
        return round(((float) $this->amount * (int) $this->probability) / 100, 2);
    }
}
