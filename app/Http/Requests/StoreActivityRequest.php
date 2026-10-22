<?php

namespace App\Http\Requests;

use App\Enums\ActivityPriority;
use App\Enums\ActivityStatus;
use App\Enums\ActivityType;
use App\Models\Activity;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Activity::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(ActivityType::class)],
            'priority' => ['required', Rule::enum(ActivityPriority::class)],
            'due_at' => ['required', 'date'],
            'status' => ['nullable', Rule::enum(ActivityStatus::class)],
            'lead_id' => ['nullable', 'exists:leads,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'deal_id' => ['nullable', 'exists:deals,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'outcome' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
