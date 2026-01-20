
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: 'ESP' | 'General English' | 'Teacher Resource' | 'Academic Skills' | 'Pedagogy' | 'Testing';
  level: 'Starter/Elementary' | 'Intermediate' | 'Advanced' | 'Professional';
  status: 'Available' | 'Checked Out';
  checkedOutTo?: string;
  dueDate?: string;
  description: string;
}

export interface CheckoutRecord {
  id: string;
  bookId: string;
  teacherId: string;
  teacherName: string;
  checkoutDate: string;
  dueDate: string;
  status: 'Active' | 'Returned';
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Teacher';
}
