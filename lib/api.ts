import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { FoodLog, MealOption, MealPlan, Profile, WorkoutLog, WorkoutPlan } from './types';

// Talks to the HealthApp backend (the same one the website uses).
//
// Set EXPO_PUBLIC_API_URL (for example http://192.168.1.20:8001) to point at a
// specific server. Otherwise the app uses the computer running Expo, which is
// where the backend runs during development.

const BACKEND_PORT = 8001;

function baseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;
  }
  // "192.168.1.20:8081" — the dev machine as the phone sees it.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:${BACKEND_PORT}`;
}

export const API_URL = baseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(`Can't reach the server at ${API_URL}. Is the backend running?`, 0);
  }
  const body = (await res.json().catch(() => null)) as
    | { success: boolean; message?: string; errors?: string[]; data: T }
    | null;
  if (!res.ok || !body?.success) {
    const detail = body?.errors?.length ? body.errors.join(', ') : body?.message;
    throw new ApiError(detail || `Request failed (${res.status})`, res.status);
  }
  return body.data;
}

const send = <T>(method: string, path: string, body?: unknown) =>
  request<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export const api = {
  profile: () => request<Profile>('/users/profile'),
  workoutPlans: () => request<WorkoutPlan[]>('/workouts/plans'),
  mealPlans: () => request<MealPlan[]>('/foods/plans'),
  mealOptions: () => request<MealOption[]>('/foods/options'),
  workoutLogs: (from: string, to: string) => request<WorkoutLog[]>(`/workouts/logs?from=${from}&to=${to}`),
  foodLogs: (from: string, to: string) => request<FoodLog[]>(`/foods/logs?from=${from}&to=${to}`),

  toggleSet: (date: string, exercise: number, set: number) =>
    send<WorkoutLog>('POST', `/workouts/logs/${date}/sets/toggle`, { exercise, set }),
  resetWorkout: (date: string) => send<WorkoutLog>('DELETE', `/workouts/logs/${date}`),
  toggleMeal: (date: string, meal: number) =>
    send<FoodLog>('POST', `/foods/logs/${date}/meals/toggle`, { meal }),
  chooseMeal: (date: string, meal: number, option: string) =>
    send<FoodLog>('PUT', `/foods/logs/${date}/choices`, { meal, option }),
};
