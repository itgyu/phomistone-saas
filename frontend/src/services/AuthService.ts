import { User, LoginCredentials, RegisterData } from '@/types/auth';

const STORAGE_KEY = 'phomistone_users';
const CURRENT_USER_KEY = 'phomistone_current_user';
const PASSWORD_KEY = 'phomistone_passwords';

class AuthService {
  private getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  private getPasswords(): Record<string, string> {
    const passwords = localStorage.getItem(PASSWORD_KEY);
    return passwords ? JSON.parse(passwords) : {};
  }

  private savePasswords(passwords: Record<string, string>): void {
    localStorage.setItem(PASSWORD_KEY, JSON.stringify(passwords));
  }

  register(data: RegisterData): User {
    const users = this.getUsers();

    if (users.some(u => u.email === data.email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      company: data.company,
      phone: data.phone,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    const passwords = this.getPasswords();
    passwords[data.email] = data.password;
    this.savePasswords(passwords);

    return newUser;
  }

  login(credentials: LoginCredentials): User | null {
    const users = this.getUsers();
    const passwords = this.getPasswords();

    const user = users.find(u => u.email === credentials.email);
    if (!user) return null;

    if (passwords[credentials.email] !== credentials.password) {
      return null;
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);

    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  }
}

export default new AuthService();
