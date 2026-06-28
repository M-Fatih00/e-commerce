export interface IUser {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  avatar: string | null;
  roles: string[];
}