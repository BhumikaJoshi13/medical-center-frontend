import { useSelector } from 'react-redux';
import { selectAuth, selectUser, selectIsAuthenticated } from '../redux/authSlice';

export const useAuth = () => {
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => user?.roles?.includes(role));
  };

  return {
    ...auth,
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
  };
};