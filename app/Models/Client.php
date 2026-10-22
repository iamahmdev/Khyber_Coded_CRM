<?php

namespace App\Models;

use App\Enums\ClientStatus;
use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $industry
 * @property string|null $website
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $city
 * @property string|null $state
 * @property string|null $postal_code
 * @property string $country
 * @property ClientStatus $status
 * @property int|null $account_manager_id
 * @property int|null $created_by
 * @property int|null $source_lead_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User|null $accountManager
 * @property-read User|null $creator
 * @property-read Lead|null $sourceLead
 * @property-read Contact|null $primaryContact
 */
#[Fillable([
    'name',
    'industry',
    'website',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'postal_code',
    'country',
    'status',
    'account_manager_id',
    'created_by',
    'source_lead_id',
    'notes',
])]
class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ClientStatus::class,
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * All contact people associated with this client.
     *
     * @return HasMany<Contact, Client>
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'client_id');
    }

    /**
     * The primary contact person for this client.
     *
     * @return HasOne<Contact, Client>
     */
    public function primaryContact(): HasOne
    {
        return $this->hasOne(Contact::class, 'client_id')->where('is_primary', true);
    }

    /**
     * The account manager or sales representative in charge of this client.
     *
     * @return BelongsTo<User, Client>
     */
    public function accountManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'account_manager_id');
    }

    /**
     * The user who originally created this client record.
     *
     * @return BelongsTo<User, Client>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The original lead that was converted into this client, if applicable.
     *
     * @return BelongsTo<Lead, Client>
     */
    public function sourceLead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'source_lead_id');
    }

    /**
     * Sales pipeline deals associated with this client.
     *
     * @return HasMany<Deal, Client>
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class, 'client_id');
    }

    /**
     * Follow-up activities and communications with this client.
     *
     * @return HasMany<Activity, Client>
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'client_id')->latest('due_at');
    }

    /**
     * Check if client is active.
     */
    public function isActive(): bool
    {
        return $this->status === ClientStatus::Active;
    }

    /**
     * Scope query to clients visible to the given user.
     *
     * @param  Builder<Client>  $query
     */
    public function scopeForUser(Builder $query, User $user): void
    {
        if ($user->isAdmin() || $user->isManager()) {
            return;
        }

        $query->where(function (Builder $sub) use ($user) {
            $sub->where('account_manager_id', $user->id)
                ->orWhere('created_by', $user->id);
        });
    }

    /**
     * Scope search query across name, email, phone, city, and industry.
     *
     * @param  Builder<Client>  $query
     */
    public function scopeSearch(Builder $query, ?string $search): void
    {
        if (empty($search)) {
            return;
        }

        $query->where(function (Builder $q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%")
                ->orWhere('industry', 'like', "%{$search}%");
        });
    }

    /**
     * Scope query by status.
     *
     * @param  Builder<Client>  $query
     */
    public function scopeStatus(Builder $query, ClientStatus|string|null $status): void
    {
        if (empty($status) || $status === 'all') {
            return;
        }

        $val = $status instanceof ClientStatus ? $status->value : $status;
        $query->where('status', $val);
    }

    /**
     * Scope query by industry.
     *
     * @param  Builder<Client>  $query
     */
    public function scopeIndustry(Builder $query, ?string $industry): void
    {
        if (empty($industry) || $industry === 'all') {
            return;
        }

        $query->where('industry', $industry);
    }
}
