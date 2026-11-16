import { Layout } from './components/Layout';
import { CardsPage } from './pages/CardsPage';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QuizHubPage } from './pages/QuizHubPage';
import { QuizPage } from './pages/QuizPage';
import { StatsPage } from './pages/StatsPage';
import { StudyPage } from './pages/StudyPage';
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
      {route.name === 'cards' && <CardsPage />}
      {route.name === 'study' && <StudyPage deckId={route.params.deck!} mode="srs" />}
      {route.name === 'free' && <StudyPage deckId={route.params.deck!} mode="free" />}
      {route.name === 'quizHub' && <QuizHubPage />}
      {route.name === 'quiz' && <QuizPage id={route.params.id!} />}
      {route.name === 'stats' && <StatsPage />}
      {route.name === 'notFound' && <NotFoundPage />}
    </Layout>
  );
};
