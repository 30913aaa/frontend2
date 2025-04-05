import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Calendar from './Calendar';
import EventList from './EventList';
import Login from './Login'; // 引入 Login 組件
import useCalendarStore from '../store/calendarStore';

const AdminPage: React.FC = () => {
  const { isEventListVisible, setSelectedDate, isLoggedIn } = useCalendarStore();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [setSelectedDate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoggedIn && <Login />} {/* 未登入時顯示登入畫面 */}
      {isLoggedIn && (
        <>
          <Header
            onSearchClick={() => {}}
            isAddEventOpen={isAddEventOpen}
            setIsAddEventOpen={setIsAddEventOpen}
          />
          <div className="relative">
            <Navigation />
          </div>
          <main className="p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Calendar />
            </div>
            {isEventListVisible && <EventList />}
          </main>
          {isAddEventOpen && <AddEventForm onClose={() => setIsAddEventOpen(false)} />}
        </>
      )}
    </div>
  );
};

// AddEventForm 組件保持不變
const AddEventForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, addEvent } = useCalendarStore();
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

export default AdminPage;