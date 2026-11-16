import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnitPage } from './pages/UnitPage';
import { matchRoute, usePath } from './router';

export const App = () => {
  const path = usePath();
  const route = matchRoute(path);

  return (
    <Layout path={path}>
      {route.name === 'home' && <HomePage />}
      {route.name === 'unit' && <UnitPage id={route.params.id!} />}
      {route.name === 'lesson' && <LessonPage id={route.params.id!} />}
      {route.name === 'notFound' && <NotFoundPage />}
    </Layout>
  );
};
