export declare class AuthService {
    register(email: string, username: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(identifier: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    registerAdmin(email: string, username: string, password: string, invite: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    refresh(refreshToken: string): {
        accessToken: string;
        refreshToken: string;
    };
}
