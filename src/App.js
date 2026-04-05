// 앱 루트 — BrowserRouter + 인증 + 레이아웃(LayoutBody) + 라우트
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LayoutBody from './components/layout/LayoutBody';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutBody>
          <AppRoutes />
        </LayoutBody>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
