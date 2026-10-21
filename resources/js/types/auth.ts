export type UserRole = 'admin' | 'manager' | 'staff' | 'client';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    phone?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};
