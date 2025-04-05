import create from 'zustand';
import { Event, Language } from '../types';

interface CalendarState {
  currentYear: number;
  currentMonth: number;
  language: Language;
  events: Event[];
  selectedDate: string | null;
  isEventListVisible: boolean;
  user: { id: string; role: string } | null;
  isLoggedIn: boolean;
  setLanguage: (lang: Language) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToToday: () => void;
  setSelectedDate: (date: string | null) => void;
  toggleEventList: () => void;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  login: (username: string, password: string) => void;
  logout: () => void;
}

// 硬編碼的帳號和密碼
const validUsername = 'aa';
const validPassword = 'aaa';

const useCalendarStore = create<CalendarState>((set) => ({
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  language: 'zh' as Language,
  events: [],
  selectedDate: null,
  isEventListVisible: true,
  user: null,
  isLoggedIn: false,
  setLanguage: (lang) => set({ language: lang }),
  prevMonth: () => set((state) => {
    const newMonth = state.currentMonth === 0 ? 11 : state.currentMonth - 1;
    const newYear = state.currentMonth === 0 ? state.currentYear - 1 : state.currentYear;
    return { currentMonth: newMonth, currentYear: newYear };
  }),
  nextMonth: () => set((state) => {
    const newMonth = state.currentMonth === 11 ? 0 : state.currentMonth + 1;
    const newYear = state.currentMonth === 11 ? state.currentYear + 1 : state.currentYear;
    return { currentMonth: newMonth, currentYear: newYear };
  }),
  goToToday: () => set({
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    selectedDate: new Date().toISOString().split('T')[0],
  }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleEventList: () => set((state) => ({ isEventListVisible: !state.isEventListVisible })),
  fetchEvents: async () => {
    try {
      const response = await fetch('https://school-calendar-backend.onrender.com/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      set({ events: data });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  },
  addEvent: async (newEvent) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('未登入');
      const response = await fetch('https://school-calendar-backend.onrender.com/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          start: newEvent.start,
          end: newEvent.end || newEvent.start,
          title_zh: newEvent.title.zh,
          title_en: newEvent.title.en || '',
          type: newEvent.type,
          grade: newEvent.grade.join(','),
        }),
      });
      if (!response.ok) throw new Error('Failed to add event');
      const addedEvent = await response.json();
      set((state) => ({ events: [...state.events, addedEvent] }));
    } catch (error) {
      console.error('Error adding event:', error);
      alert('請先登入以新增事件');
    }
  },
  deleteEvent: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('未登入');
      const response = await fetch('https://school-calendar-backend.onrender.com/admin/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete event');
      set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('請先登入以刪除事件');
    }
  },
  updateEvent: async (updatedEvent) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('未登入');
      const response = await fetch('https://school-calendar-backend.onrender.com/admin/update/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: updatedEvent.id,
          start: updatedEvent.start,
          end: updatedEvent.end || null,
          title_zh: updatedEvent.title.zh,
          title_en: updatedEvent.title.en || '',
          type: updatedEvent.type,
          grade: updatedEvent.grade.join(','),
        }),
      });
      if (!response.ok) throw new Error('Failed to update event');
      set((state) => ({
        events: state.events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
      }));
    } catch (error) {
      console.error('Error updating event:', error);
      alert('請先登入以修改事件');
    }
  },
  login: (username, password) => {
    if (username === validUsername && password === validPassword) {
      const user = { id: 'hardcoded-user', role: 'admin' }; // 假設角色為 admin
      set({ user, isLoggedIn: true });
      localStorage.setItem('token', 'hardcoded-token'); // 模擬令牌
      alert('登入成功');
    } else {
      alert('帳號或密碼錯誤');
    }
  },
  logout: () => {
    set({ user: null, isLoggedIn: false });
    localStorage.removeItem('token');
  },
}));

export default useCalendarStore;