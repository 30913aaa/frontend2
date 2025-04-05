import * as React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import useCalendarStore from '../store/calendarStore';
import { Event } from '../types';

const EventList: React.FC = () => {
  const { events, language, isEventListVisible, deleteEvent, updateEvent, selectedDate, setSelectedDate, isLoggedIn, user } = useCalendarStore();
  const [contextMenu, setContextMenu] = useState<{ eventId: string; x: number; y: number } | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const translations = {
    en: {
      noEvents: 'No events',
      allEvents: 'All Events',
      schoolActivityType: 'School Activity',
      meetingType: 'Meeting',
      examType: 'Exam',
      importantExamType: 'Important Exam',
      lectureType: 'Lecture',
      announcementType: 'Announcement',
      uniformInspectionType: 'Uniform Inspection',
      holidayType: 'Holiday',
      otherType: 'Other',
      viewDetails: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
      submit: 'Submit',
      cancel: 'Cancel',
      selectType: 'Select Event Type',
      allTypes: 'All Types',
      eventsForDate: 'Events for',
      todayEvents: 'Today\'s Events'
    },
    zh: {
      noEvents: '無事件',
      allEvents: '所有事件',
      schoolActivityType: '活動/務實',
      meetingType: '會議/研習',
      examType: '檢定/測驗',
      importantExamType: '重要考試',
      lectureType: '課程/講座',
      announcementType: '公告',
      uniformInspectionType: '服儀定期檢查',
      holidayType: '假期',
      otherType: '其他',
      viewDetails: '查看詳情',
      edit: '修改',
      delete: '刪除',
      submit: '提交',
      cancel: '取消',
      selectType: '選擇事件類型',
      allTypes: '所有類型',
      eventsForDate: '日期事件:',
      todayEvents: '今日事件'
    },
  };

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      'important-exam': 'var(--event-exam, #f97316)',
      'school-activity': 'var(--event-activity, #3b82f6)',
      'announcement': 'var(--event-announcement, #eab308)',
      'holiday': 'var(--event-holiday, #22c55e)',
      'meeting': 'var(--event-meeting, #8b5cf6)',
      'exam': 'var(--event-exam, #f97316)',
      'lecture': 'var(--event-lecture, #14b8a6)',
      'uniform-inspection': 'var(--event-uniform-inspection, #ec4899)',
      'other': 'var(--event-other, #6b7280)',
    };
    return colors[type] || 'var(--event-other, #6b7280)';
  };

  // 在組件載入時設定 selectedDate 為今日日期（如果尚未設定）
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0]; // 格式為 YYYY-MM-DD，例如 "2025-04-04"
      setSelectedDate(today);
    }
  }, [selectedDate, setSelectedDate]);

  const handleContextMenu = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    if (!isLoggedIn || user?.role !== 'admin') return; // 未登入或非管理員無法顯示右鍵選單
    if (contextMenu) {
      setContextMenu(null);
    } else {
      setContextMenu({ eventId, x: 0, y: 0 });
    }
  };

  const handleDelete = (eventId: string) => {
    deleteEvent(eventId);
    setContextMenu(null);
  };

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setContextMenu(null);
  };

  const handleEditSubmit = () => {
    if (editEvent) {
      updateEvent(editEvent);
      setEditEvent(null);
    }
  };

  const isEventInDate = (event: Event, dateString: string) => {
    if (!dateString) return true;
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    const eventStart = new Date(event.start);
    eventStart.setHours(0, 0, 0, 0);
    
    const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
    eventEnd.setHours(0, 0, 0, 0);
    
    return selectedDate >= eventStart && selectedDate <= eventEnd;
  };

  const filteredEvents = events.filter(event => {
    const matchesType = selectedType ? event.type === selectedType : true;
    const matchesDate = selectedDate ? isEventInDate(event, selectedDate) : true;
    return matchesType && matchesDate;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US');
  };

  if (!isEventListVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full md:w-80 relative">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations[language].selectType}
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white cursor-pointer"
        >
          <option value="">{translations[language].allTypes}</option>
          <option value="important-exam">{translations[language].importantExamType}</option>
          <option value="school-activity">{translations[language].schoolActivityType}</option>
          <option value="announcement">{translations[language].announcementType}</option>
          <option value="holiday">{translations[language].holidayType}</option>
          <option value="meeting">{translations[language].meetingType}</option>
          <option value="exam">{translations[language].examType}</option>
          <option value="lecture">{translations[language].lectureType}</option>
          <option value="uniform-inspection">{translations[language].uniformInspectionType}</option>
          <option value="other">{translations[language].otherType}</option>
        </select>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        {selectedDate ? 
          `${translations[language].eventsForDate} ${formatDate(selectedDate)}` : 
          translations[language].todayEvents}
      </h2>
      
      {filteredEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{translations[language].noEvents}</p>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event, index) => (
            <div key={index} className="relative">
              <details
                className="group rounded-lg border border-gray-200 [&_summary::-webkit-details-marker]:hidden"
                onContextMenu={(e) => handleContextMenu(e, event.id)}
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1 pr-4">
                    <div className="font-medium mb-1">{event.title[language]}</div>
                    <div className="text-sm text-gray-500">
                      {event.start === event.end
                        ? new Date(event.start).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')
                        : `${new Date(event.start).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')} - 
                         ${new Date(event.end || event.start).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}`}
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="text-gray-400 transform transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.grade.map((grade, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {grade.replace('grade-', '高').replace('all-grades', '全年級')}
                      </span>
                    ))}
                    <span
                      className="text-xs px-2.5 py-1 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    >
                      {translations[language][`${event.type.replace(/-/g, '')}Type` as keyof typeof translations.en]}
                    </span>
                  </div>
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-sm inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {translations[language].viewDetails}
                    </a>
                  )}
                </div>
              </details>
              {contextMenu && contextMenu.eventId === event.id && isLoggedIn && user?.role === 'admin' && (
                <div className="absolute top-0 right-0 mt-2 mr-2 bg-white border rounded-lg shadow-lg p-2 z-50">
                  <button
                    onClick={() => handleEdit(filteredEvents.find(e => e.id === contextMenu.eventId)!)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {translations[language].edit}
                  </button>
                  <button
                    onClick={() => handleDelete(contextMenu.eventId)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    {translations[language].delete}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {editEvent && isLoggedIn && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{translations[language].edit}</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editEvent.title.zh}
                onChange={(e) => setEditEvent({ ...editEvent, title: { ...editEvent.title, zh: e.target.value } })}
                placeholder={translations.zh.noEvents}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                value={editEvent.title.en}
                onChange={(e) => setEditEvent({ ...editEvent, title: { ...editEvent.title, en: e.target.value } })}
                placeholder={translations.en.noEvents}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="date"
                value={editEvent.start}
                onChange={(e) => setEditEvent({ ...editEvent, start: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="date"
                value={editEvent.end || ''}
                onChange={(e) => setEditEvent({ ...editEvent, end: e.target.value || editEvent.start })}
                className="w-full p-2 border rounded-lg"
              />
              <select
                value={editEvent.type}
                onChange={(e) => setEditEvent({ ...editEvent, type: e.target.value as any })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="important-exam">重要考試</option>
                <option value="school-activity">學校活動</option>
                <option value="announcement">公告</option>
                <option value="holiday">假期</option>
              </select>
              <select
                multiple
                value={editEvent.grade}
                onChange={(e) => setEditEvent({ ...editEvent, grade: Array.from(e.target.selectedOptions, option => option.value) })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="grade-1">高一</option>
                <option value="grade-2">高二</option>
                <option value="grade-3">高三</option>
                <option value="all-grades">全年級</option>
              </select>
              <div className="flex gap-2">
                <button onClick={handleEditSubmit} className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                  {translations[language].submit}
                </button>
                <button onClick={() => setEditEvent(null)} className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300">
                  {translations[language].cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;