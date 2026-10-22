<?php

namespace App\Http\Requests;

use App\Enums\DealStage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDealStageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $deal = $this->route('deal');

        return $this->user()?->can('updateStage', $deal) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stage' => ['required', Rule::enum(DealStage::class)],
            'loss_reason' => ['nullable', 'string', 'max:255', Rule::requiredIf($this->input('stage') === DealStage::Lost->value)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
