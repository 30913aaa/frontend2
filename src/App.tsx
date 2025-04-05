import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Calendar from './components/Calendar';
import EventList from './components/EventList';
import SearchPanel from './components/SearchPanel';
import AdminPage from './components/AdminPage';
import useCalendarStore from './store/calendarStore';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { isEventListVisible, fetchEvents, addEvent, language } = useCalendarStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 簡單的登入表單組件
  const LoginPage = () => {
    const handleLogin = () => {
      setIsLoggedIn(true);
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">請登入</h2>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          >
            登入（模擬）
          </button>
        </div>
      </div>
    );
  };

  // 新增事件表單組件
  const AddEventForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [titleZh, setTitleZh] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [type, setType] = useState<'important-exam' | 'school-activity' | 'announcement' | 'holiday'>('important-exam');
    const [grade, setGrade] = useState<string[]>([]);

    const translations = {
      en: { addEvent: 'Add Event', title: 'Title', start: 'Start Date', end: 'End Date', type: 'Type', grade: 'Grade', submit: 'Submit', cancel: 'Cancel' },
      zh: { addEvent: '新增事件', title: '標題', start: '開始日期', end: '結束日期', type: '類別', grade: '年級', submit: '提交', cancel: '取消' },
    };

    const handleSubmit = async () => {
      const newEvent = {
        title: { zh: titleZh, en: titleEn },
        description: { zh: '', en: '' },
        start,
        end: end || start,
        type: type as 'important-exam' | 'school-activity' | 'announcement' | 'holiday',
        grade,
      };
      await addEvent(newEvent);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">{translations[language].addEvent}</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={titleZh}
              onChange={(e) => setTitleZh(e.target.value)}
              placeholder={translations.zh.title}
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={translations.en.title}
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'important-exam' | 'school-activity' | 'announcement' | 'holiday')}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">選擇類別</option>
              <option value="important-exam">重要考試</option>
              <option value="school-activity">學校活動</option>
              <option value="announcement">公告</option>
              <option value="holiday">假期</option>
            </select>
            <select
              multiple
              value={grade}
              onChange={(e) => setGrade(Array.from(e.target.selectedOptions, (option) => option.value))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="grade-1">高一</option>
              <option value="grade-2">高二</option>
              <option value="grade-3">高三</option>
              <option value="all-grades">全年級</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                {translations[language].submit}
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300">
                {translations[language].cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* 首頁路由 */}
          <Route
            path="/"
            element={
              <>
                <Header
                  onSearchClick={() => setIsSearchOpen(true)}
                  isAddEventOpen={isAddEventOpen}
                  setIsAddEventOpen={setIsAddEventOpen}
                />
                <Navigation />
                <main className="p-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <Calendar />
                  </div>
                  {isEventListVisible && <EventList />}
                </main>
                <SearchPanel
                  isOpen={isSearchOpen}
                  onClose={() => setIsSearchOpen(false)}
                />
                {isAddEventOpen && <AddEventForm onClose={() => setIsAddEventOpen(false)} />}
                <footer className="mt-8 py-4 text-center text-gray-600 border-t bg-white">
                  <p>© 2025 學校日曆系統</p>
                  <div className="mt-2 space-x-4">
                    <a href="#" className="hover:text-gray-900">關於</a>
                    <a href="#" className="hover:text-gray-900">使用說明</a>
                    <a href="#" className="hover:text-gray-900">意見回饋</a>
                  </div>
                </footer>
              </>
            }
          />
          {/* Admin 頁面路由 */}
          <Route
            path="/admin"
            element={
              isLoggedIn ? (
                <AdminPage />
              ) : (
                <LoginPage />
              )
            }
          />
          {/* 其他路由重定向到首頁 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;