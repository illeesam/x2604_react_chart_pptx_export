// 앱 루트 — BrowserRouter + 인증 + 레이아웃(LayoutMain) + 라우트
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LayoutMain from './components/layout/LayoutMain';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutMain>
          <AppRoutes />
        </LayoutMain>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
