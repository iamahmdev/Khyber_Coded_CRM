<?php

namespace App\Models;

use Database\Factories\ContactFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $client_id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $title
 * @property string|null $department
 * @property bool $is_primary
 * @property int|null $portal_user_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Client $client
 * @property-read User|null $portalUser
 */
#[Fillable([
    'client_id',
    'name',
    'email',
    'phone',
    'title',
    'department',
    'is_primary',
    'portal_user_id',
    'notes',
])]
class Contact extends Model
{
    /** @use HasFactory<ContactFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * The client company this contact belongs to.
     *
     * @return BelongsTo<Client, Contact>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    /**
     * Associated portal user account, if provisioned for Module 31 Client Portal.
     *
     * @return BelongsTo<User, Contact>
     */
    public function portalUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'portal_user_id');
    }

    /**
     * Set this contact as the primary contact for the client.
     */
    public function setAsPrimary(): void
    {
        // Unmark any other primary contact for this client
        static::where('client_id', $this->client_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        $this->update(['is_primary' => true]);
    }
}
