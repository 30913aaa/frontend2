import React, { useState } from 'react';
import useCalendarStore from '../store/calendarStore';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggedIn, logout } = useCalendarStore();

  const handleLogin = () => {
    login(username, password); // 調用 store 的 login 方法
  };

  const handleLogout = () => {
    logout(); // 調用 store 的 logout 方法
  };

  if (isLoggedIn) {
    return (
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">登入</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用戶名"
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼"
            className="w-full p-2 border rounded-lg"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          >
            登入
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;