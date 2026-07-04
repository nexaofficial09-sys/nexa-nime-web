import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/auth/status`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth status error:", err);
      setUser(null);
    } finally {
      setLoading(false);
      // Fetch notifications whether user is logged in or not
      fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://103.30.195.243:5000/api/notifications`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        let notifs = data.notifications;
        
        // Handle guest read status via localStorage
        try {
            const isGuest = !user && !document.cookie.includes('session'); // rough check, actual user state might be lagging in fetchStatus
            const guestReadIds = JSON.parse(localStorage.getItem('guest_read_notifs') || '[]');
            notifs = notifs.map(n => ({
                ...n,
                is_read: n.is_read || guestReadIds.includes(n.id)
            }));
        } catch (e) {}

        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      if (!user) {
         const guestReadIds = JSON.parse(localStorage.getItem('guest_read_notifs') || '[]');
         if (!guestReadIds.includes(id)) {
            guestReadIds.push(id);
            localStorage.setItem('guest_read_notifs', JSON.stringify(guestReadIds));
         }
      }
      
      await fetch(`http://103.30.195.243:5000/api/notifications/read/${id}`, { method: 'POST', credentials: 'include' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await fetch(`http://103.30.195.243:5000/api/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, notifications, unreadCount, markAsRead, fetchNotifications, logout, fetchStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
