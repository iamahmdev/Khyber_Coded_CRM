<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $targetUser = $this->route('user');

        return $targetUser instanceof User && ($this->user()?->can('update', $targetUser) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $targetUser = $this->route('user');
        $targetUserId = $targetUser instanceof User ? $targetUser->id : null;
        $currentUser = $this->user();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($targetUserId),
            ],
            'password' => ['nullable', 'string', Password::default(), 'confirmed'],
            'phone' => ['nullable', 'string', 'max:30'],
        ];

        // Only administrators can change roles and statuses
        if ($currentUser?->isAdmin()) {
            $rules['role'] = ['required', Rule::enum(UserRole::class)];
            $rules['status'] = ['required', Rule::enum(UserStatus::class)];
        } else {
            $rules['role'] = ['prohibited'];
            $rules['status'] = ['prohibited'];
        }

        return $rules;
    }

    /**
     * Configure the validator instance with custom business rules.
     *
     * @param  Validator  $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $targetUser = $this->route('user');

            if (! $targetUser instanceof User) {
                return;
            }

            // If the target user is currently an Admin and the request attempts to change their role or status
            if ($targetUser->isAdmin()) {
                $newRole = $this->input('role');
                $newStatus = $this->input('status');

                $isChangingRole = $newRole !== null && $newRole !== UserRole::Admin->value;
                $isDeactivating = $newStatus !== null && $newStatus !== UserStatus::Active->value;

                if ($isChangingRole || $isDeactivating) {
                    $otherActiveAdmins = User::where('role', UserRole::Admin->value)
                        ->where('status', UserStatus::Active->value)
                        ->where('id', '!=', $targetUser->id)
                        ->count();

                    if ($otherActiveAdmins === 0) {
                        $validator->errors()->add(
                            'role',
                            'Cannot demote or deactivate the last remaining active Administrator.'
                        );
                    }
                }
            }
        });
    }
}
