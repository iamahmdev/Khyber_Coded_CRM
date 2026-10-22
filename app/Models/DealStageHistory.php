<?php

namespace App\Models;

use App\Enums\DealStage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealStageHistory extends Model
{
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'deal_id',
        'user_id',
        'from_stage',
        'to_stage',
        'notes',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Parent deal.
     */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    /**
     * User who initiated this transition.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Human-readable label for the starting stage.
     */
    public function getFromStageLabelAttribute(): ?string
    {
        return $this->from_stage ? (DealStage::tryFrom($this->from_stage)?->label() ?? ucfirst($this->from_stage)) : null;
    }

    /**
     * Human-readable label for the target stage.
     */
    public function getToStageLabelAttribute(): string
    {
        return DealStage::tryFrom($this->to_stage)?->label() ?? ucfirst($this->to_stage);
    }
}
