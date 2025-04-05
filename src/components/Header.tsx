import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendarWeek, faPlus } from '@fortawesome/free-solid-svg-icons';
import useCalendarStore from '../store/calendarStore';
import { Language } from '../types';

interface HeaderProps {
  onSearchClick: () => void;
  isAddEventOpen?: boolean;
  setIsAddEventOpen?: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick, isAddEventOpen, setIsAddEventOpen }) => {
  const { language, setLanguage, isLoggedIn, user } = useCalendarStore();

  const translations = {
    en: { title: 'School Calendar' },
    zh: { title: '學校日曆' },
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-50">
      <img src="/logo.png" alt="School Logo" className="h-10 mr-4" />
      <h1 className="text-2xl font-semibold text-blue-600 flex-1">
        {translations[language].title}
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Search events"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
        {setIsAddEventOpen && isLoggedIn && user?.role === 'admin' && (
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Add event"
            title={language === 'zh' ? '新增事件' : 'Add Event'}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
        <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Toggle view">
          <FontAwesomeIcon icon={faCalendarWeek} />
        </button>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="p-2 border rounded-lg bg-white cursor-pointer"
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
    </header>
  );
};

export default Header;