export interface User {
  id: number;
  email: string;
  name: string;
  address?: Address;
  phone?: string;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}