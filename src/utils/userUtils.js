/**
 * Robustly resolves the user's name from a certification or user object.
 * Handles patterns such as user.firstName/user.lastName, user.name, and direct userName fields.
 */
export const getUserName = (certOrUser) => {
  if (!certOrUser) return "Unknown";

  // Check if it's a certification object with a user sub-object
  const user = certOrUser.user || certOrUser;

  if (user) {
    if (user.firstName && user.lastName) {
      return `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`.trim();
    }
    if (user.name) return user.name;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.username) return user.username;
    if (user.email) return user.email.split("@")[0];
  }

  // Fallback for direct fields on the certification object
  return certOrUser.userName || certOrUser.studentName || certOrUser.name || "Unknown";
};
