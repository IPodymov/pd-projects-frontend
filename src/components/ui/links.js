// UI links builder for NavBar
// Returns an array of { key, label, to, type }
export function getNavLinks(role, schoolId) {
  switch (role) {
    case 'admin':
    case 'university_staff':
      return [
        { key: 'users', label: 'Все пользователи', to: '/users', type: 'link' },
        { key: 'schools', label: 'Школы', to: '/schools', type: 'link' },
        // "Все проекты" намеренно убрано по требованию
      ];
    case 'teacher':
      return [
        {
          key: 'school-projects',
          label: 'Проекты школы',
          to: `/school/${schoolId || ''}/projects`,
          type: 'link',
        },
        {
          key: 'school-students',
          label: 'Ученики школы',
          to: `/school/${schoolId || ''}/students`,
          type: 'link',
        },
      ];
    default:
      return [];
  }
}
