<?php

namespace App\Http\Requests;

use App\Enums\LeadPriority;
use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Lead $lead */
        $lead = $this->route('lead');

        return $this->user()?->can('update', $lead) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Lead $lead */
        $lead = $this->route('lead');

        return [
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                // Prevent duplicate active leads, ignoring the current lead record
                Rule::unique('leads', 'email')
                    ->ignore($lead->id)
                    ->where(fn ($query) => $query
                        ->whereNull('deleted_at')
                        ->whereNotIn('status', [LeadStatus::Converted->value, LeadStatus::Lost->value])
                    ),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:150'],
            'source' => ['required', Rule::enum(LeadSource::class)],
            'status' => ['required', Rule::enum(LeadStatus::class)],
            'priority' => ['required', Rule::enum(LeadPriority::class)],
            'estimated_value' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'currency' => ['nullable', 'string', 'size:3'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'lost_reason' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf($this->input('status') === LeadStatus::Lost->value),
            ],
        ];
    }

    /**
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'An active lead with this email address already exists in the sales pipeline.',
            'lost_reason.required' => 'Please provide a reason why this lead was marked as lost.',
        ];
    }
}
