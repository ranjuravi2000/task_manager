
import API from "./axiosInstance";

// Get all notifications
export const getNotifications = async () => {
  const response = await API.get("/notifications");

  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await API.put(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await API.put(
    "/notifications/read-all"
  );

  return response.data;
};

// Delete notification
export const deleteNotification = async (
  notificationId
) => {
  const response = await API.delete(
    `/notifications/${notificationId}`
  );

  return response.data;
};
