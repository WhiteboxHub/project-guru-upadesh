import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/ui/use-toast';

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isAuthenticated, login: setAuth, logout: clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      router.push('/login');
    },
    onError: () => {
      clearAuth();
      router.push('/login');
    },
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated && !!token,
    retry: false,
  });

  return {
    user: user || profile,
    token,
    isAuthenticated,
    isLoadingProfile,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
