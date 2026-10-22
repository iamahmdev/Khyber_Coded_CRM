<?php

namespace App\Models;

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $company
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $title
 * @property LeadSource $source
 * @property LeadStatus $status
 * @property LeadPriority $priority
 * @property float|null $estimated_value
 * @property string $currency
 * @property int|null $assigned_to
 * @property int|null $created_by
 * @property string|null $notes
 * @property string|null $lost_reason
 * @property Carbon|null $converted_at
 * @property int|null $converted_to_client_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User|null $assignedTo
 * @property-read User|null $creator
 */
#[Fillable([
    'name',
    'company',
    'email',
    'phone',
    'title',
    'source',
    'status',
    'priority',
    'estimated_value',
    'currency',
    'assigned_to',
    'created_by',
    'notes',
    'lost_reason',
    'converted_at',
    'converted_to_client_id',
])]
class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'source' => LeadSource::class,
            'status' => LeadStatus::class,
            'priority' => LeadPriority::class,
            'estimated_value' => 'decimal:2',
            'converted_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * The sales representative or team member assigned to this lead.
     *
     * @return BelongsTo<User, Lead>
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The user who originally created or captured this lead.
     *
     * @return BelongsTo<User, Lead>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The client record created upon converting this lead.
     *
     * @return BelongsTo<Client, Lead>
     */
    public function convertedClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'converted_to_client_id');
    }

    /**
     * Sales pipeline deals originating from or linked to this lead.
     *
     * @return HasMany<Deal, Lead>
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class, 'lead_id');
    }

    /**
     * Check if this lead has been converted to a client.
     */
    public function isConverted(): bool
    {
        return $this->status === LeadStatus::Converted || $this->converted_at !== null;
    }

    /**
     * Check if this lead is marked as qualified.
     */
    public function isQualified(): bool
    {
        return $this->status === LeadStatus::Qualified;
    }

    /**
     * Mark the lead as converted.
     */
    public function markAsConverted(?int $clientId = null): void
    {
        $this->update([
            'status' => LeadStatus::Converted,
            'converted_at' => now(),
            'converted_to_client_id' => $clientId,
        ]);
    }

    /**
     * Scope query to leads visible to a specific user.
     *
     * @param  Builder<Lead>  $query
     */
    public function scopeForUser(Builder $query, User $user): void
    {
        // Admins and Managers have visibility across all leads
        if ($user->isAdmin() || $user->isManager()) {
            return;
        }

        // Staff members only see leads assigned to or created by them
        $query->where(function (Builder $subQuery) use ($user) {
            $subQuery->where('assigned_to', $user->id)
                ->orWhere('created_by', $user->id);
        });
    }

    /**
     * Scope query by search term across name, company, email, or phone.
     *
     * @param  Builder<Lead>  $query
     */
    public function scopeSearch(Builder $query, ?string $search): void
    {
        if (empty($search)) {
            return;
        }

        $query->where(function (Builder $q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('company', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    /**
     * Scope query by lead status.
     *
     * @param  Builder<Lead>  $query
     */
    public function scopeStatus(Builder $query, LeadStatus|string|null $status): void
    {
        if (empty($status) || $status === 'all') {
            return;
        }

        $value = $status instanceof LeadStatus ? $status->value : $status;
        $query->where('status', $value);
    }

    /**
     * Scope query by lead source.
     *
     * @param  Builder<Lead>  $query
     */
    public function scopeSource(Builder $query, LeadSource|string|null $source): void
    {
        if (empty($source) || $source === 'all') {
            return;
        }

        $value = $source instanceof LeadSource ? $source->value : $source;
        $query->where('source', $value);
    }

    /**
     * Scope query by lead priority.
     *
     * @param  Builder<Lead>  $query
     */
    public function scopePriority(Builder $query, LeadPriority|string|null $priority): void
    {
        if (empty($priority) || $priority === 'all') {
            return;
        }

        $value = $priority instanceof LeadPriority ? $priority->value : $priority;
        $query->where('priority', $value);
    }
}
