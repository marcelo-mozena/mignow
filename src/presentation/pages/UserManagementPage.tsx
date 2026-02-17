'use client';

import React from 'react';
import { UserList } from '@/presentation/components/features/users/UserList';
import { CreateUserDialog } from '@/presentation/components/features/users/CreateUserDialog';

export const UserManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage your application users</p>
        </div>
        <CreateUserDialog />
      </div>
      <UserList />
    </div>
  );
};
