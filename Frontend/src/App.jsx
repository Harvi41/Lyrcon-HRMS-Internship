import { useState } from 'react';
import Login from './Pages/Login';
import Signup from './Pages/Signup';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login onSwitch={() => setIsLogin(false)} />
      ) : (
        <Signup onSwitch={() => setIsLogin(true)} />
      )}
    </>
  );
}

export default App;