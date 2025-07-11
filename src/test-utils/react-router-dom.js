import React from 'react';

const RouterWrapper = ({ children, initialEntries }) => {
  if (initialEntries?.length) {
    window.history.pushState({}, '', initialEntries[0]);
  }
  return <>{children}</>;
};

export const BrowserRouter = RouterWrapper;
export const MemoryRouter = RouterWrapper;
export const HashRouter = RouterWrapper;

const matchPath = (routePath, pathname) => {
  if (!routePath) return false;
  if (routePath === '*' || routePath === pathname) return true;
  const routeSegments = routePath.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);
  if (routeSegments.length !== pathSegments.length) return false;
  return routeSegments.every((segment, index) => (
    segment.startsWith(':') || segment === pathSegments[index]
  ));
};

export const Routes = ({ children }) => {
  const pathname = window.location.pathname || '/';
  const routes = React.Children.toArray(children).filter(Boolean);

  for (const route of routes) {
    if (!React.isValidElement(route)) continue;
    const { path, index, element, children: routeChildren } = route.props || {};
    if (index && pathname === '/') {
      return element || routeChildren || null;
    }
    if (matchPath(path, pathname)) {
      return element || routeChildren || null;
    }
  }

  return null;
};

export const Route = () => null;

export const Link = React.forwardRef(({ to, children, ...rest }, ref) => {
  const href = typeof to === 'string' ? to : to?.pathname || '';
  return (
    <a href={href} ref={ref} {...rest}>
      {children}
    </a>
  );
});

Link.displayName = 'Link';
export const NavLink = Link;

export const Outlet = ({ children }) => children || null;
export const Navigate = ({ to }) => <Link to={to} />;

export const useNavigate = () => () => {};
export const useParams = () => ({});
export const useLocation = () => ({
  pathname: window.location.pathname || '/',
  search: window.location.search || '',
  hash: window.location.hash || '',
  state: null,
  key: 'default',
});
