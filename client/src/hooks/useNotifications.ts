"use client";
import { useState, useEffect } from 'react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      if (!token) return;

      try {
        const res = await fetch('/api/tickets/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUnreadCount(data.count || 0);
          }
        }
      } catch (e) {
        // silently fail for background polling
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { unreadCount, setUnreadCount };
}
