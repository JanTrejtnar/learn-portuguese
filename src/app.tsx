import { Layout } from './components/Layout';
import { CardsPage } from './pages/CardsPage';
import { GrammarPage } from './pages/GrammarPage';
import { GrammarRefPage } from './pages/GrammarRefPage';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MapPage } from './pages/MapPage';
import { PairsPage } from './pages/PairsPage';
import { PracticePage } from './pages/PracticePage';
import { RoleplayHubPage } from './pages/RoleplayHubPage';
import { RoleplayPage } from './pages/RoleplayPage';
import { ShopPage } from './pages/ShopPage';
import { CollectionPage } from './pages/CollectionPage';
import { SettingsPage } from './pages/SettingsPage';
import { SpeakPage } from './pages/SpeakPage';
import { QuizHubPage } from './pages/QuizHubPage';
import { QuizPage } from './pages/QuizPage';
import { StatsPage } from './pages/StatsPage';
import { StudyPage } from './pages/StudyPage';
import { WelcomePage } from './pages/WelcomePage';
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
      {route.name === 'practice' && <PracticePage />}
      {route.name === 'roleplayHub' && <RoleplayHubPage />}
      {route.name === 'roleplay' && <RoleplayPage id={route.params.id!} />}
      {route.name === 'pairs' && <PairsPage />}
      {route.name === 'settings' && <SettingsPage />}
      {route.name === 'grammarRef' && <GrammarRefPage />}
      {route.name === 'grammar' && <GrammarPage />}
      {route.name === 'shop' && <ShopPage />}
      {route.name === 'collection' && <CollectionPage />}
      {route.name === 'speak' && <SpeakPage />}
      {route.name === 'map' && <MapPage />}
      {route.name === 'stats' && <StatsPage />}
      {route.name === 'welcome' && <WelcomePage />}
      {route.name === 'notFound' && <NotFoundPage />}
    </Layout>
  );
};
