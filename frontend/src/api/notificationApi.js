import API from "./axiosInstance";

// Get all notifications-------//
export const getNotifications = async () => {
  const response = await API.get("/tasks/notification");

  return response.data;
};

// Mark notification as read---------//
export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await API.put(
    `/tasks/notification/${notificationId}/read`
  );

  return response.data;
};

// Delete notification------//
export const deleteNotification = async (
  notificationId
) => {
  const response = await API.delete(
    `/tasks/notification/${notificationId}`
  );

  return response.data;
};