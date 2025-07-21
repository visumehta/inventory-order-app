export interface User {
  _id?: number;
  name: string;
  email: string;
  password_hash?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;
  // user: User;
  name: string;
  role: string;
  isBanned: boolean;
}