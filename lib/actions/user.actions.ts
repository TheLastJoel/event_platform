'use server'

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import User from '@/lib/database/models/user.model';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import { handleError } from '@/lib/utils';

import { CreateUserParams, UpdateUserParams } from '@/types';

export async function createUser(user: CreateUserParams) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    console.log('Creating user:', user);
    const newUser = await User.create(user);
    console.log('User created successfully:', newUser);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error('Failed to create user:', error);
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    console.log('Fetching user by ID:', userId);
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found:', userId);
      throw new Error('User not found');
    }

    console.log('User found:', user);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Failed to get user:', error);
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    console.log('Updating user:', { clerkId, user });
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

    if (!updatedUser) {
      console.error('User update failed:', clerkId);
      throw new Error('User update failed');
    }

    console.log('User updated successfully:', updatedUser);
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Failed to update user:', error);
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    console.log('Finding user to delete:', clerkId);
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      console.error('User not found:', clerkId);
      throw new Error('User not found');
    }

    console.log('Unlinking user relationships:', { events: userToDelete.events, orders: userToDelete.orders });
    await Promise.all([
      Event.updateMany({ _id: { $in: userToDelete.events } }, { $pull: { organizer: userToDelete._id } }),
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
    ]);

    console.log('Deleting user:', userToDelete._id);
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath('/');

    console.log('User deleted successfully:', deletedUser);
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    console.error('Failed to delete user:', error);
    handleError(error);
  }
}
