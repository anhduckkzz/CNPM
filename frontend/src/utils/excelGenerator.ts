import * as XLSX from 'xlsx';

interface StudentPerformanceData {
  studentId: string;
  name: string;
  major: string;
  currentGPA: string;
  overallGPA: string;
  totalCredits: string;
  semesterCredits: string;
  courses: string;
  scores: string;
  participation: string;
  status: string;
}

interface ScholarshipData {
  studentId: string;
  name: string;
  major: string;
  currentGPA: string;
  overallGPA: string;
  eligibility: string;
  scholarshipAmount: string;
  applicationDate: string;
  status: string;
  notes: string;
}

interface FeedbackData {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  instructor: string;
  sessionDate: string;
  rating: string;
  attendanceRate: string;
  comments: string;
  concerns: string;
}

export const generatePerformanceAnalysisSpreadsheet = (students: any[]): void => {
  // Prepare data for the spreadsheet
  const data: StudentPerformanceData[] = students.map((student, index) => ({
    studentId: student.studentId,
    name: student.name,
    major: student.major,
    currentGPA: student.gpa,
    overallGPA: student.overallGpa || (Number(student.gpa) + 0.07).toFixed(2),
    totalCredits: student.totalCredits || (120 - index * 4).toString(),
    semesterCredits: student.semesterCredits || (18 - index * 2).toString(),
    courses: student.courses || 'CS101, CS102, MATH201, PHY101',
    scores: student.scores || '85, 92, 88, 90',
    participation: student.participation || `${Math.floor(Math.random() * 20 + 80)}%`,
    status: student.status,
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Student ID
    { wch: 20 }, // Name
    { wch: 20 }, // Major
    { wch: 12 }, // Current GPA
    { wch: 12 }, // Overall GPA
    { wch: 14 }, // Total Credits
    { wch: 16 }, // Semester Credits
    { wch: 30 }, // Courses
    { wch: 20 }, // Scores
    { wch: 14 }, // Participation
    { wch: 12 }, // Status
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Performance Analysis');

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Performance_Analysis_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);
};

export const generateScholarshipReportSpreadsheet = (students: any[]): void => {
  // Prepare data for the spreadsheet
  const data: ScholarshipData[] = students.map((student) => {
    const numericGpa = Number(student.gpa);
    const eligibility = numericGpa >= 3.7 ? 'High Priority' : numericGpa >= 3.5 ? 'Eligible' : 'Review';
    const scholarshipAmount = 
      numericGpa >= 3.8 ? '$3,500' :
      numericGpa >= 3.6 ? '$2,000' :
      numericGpa >= 3.5 ? '$1,500' : 'N/A';

    return {
      studentId: student.studentId,
      name: student.name,
      major: student.major,
      currentGPA: student.gpa,
      overallGPA: student.overallGpa || (numericGpa + 0.07).toFixed(2),
      eligibility,
      scholarshipAmount,
      applicationDate: student.applicationDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: student.status === 'Active' ? 'Ready for Review' : student.status,
      notes: numericGpa >= 3.7 ? 'Excellent academic performance' : numericGpa >= 3.5 ? 'Meets eligibility criteria' : 'Under review',
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Student ID
    { wch: 20 }, // Name
    { wch: 20 }, // Major
    { wch: 12 }, // Current GPA
    { wch: 12 }, // Overall GPA
    { wch: 15 }, // Eligibility
    { wch: 18 }, // Scholarship Amount
    { wch: 15 }, // Application Date
    { wch: 18 }, // Status
    { wch: 35 }, // Notes
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Scholarship Report');

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Scholarship_Report_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);
};

export const generateFeedbackReportSpreadsheet = (feedbackData: any[]): void => {
  // Prepare data for the spreadsheet
  const data: FeedbackData[] = feedbackData.map((item) => ({
    studentId: item.studentId || 'STU-' + Math.floor(Math.random() * 90000 + 10000),
    studentName: item.studentName || item.name || 'Anonymous',
    courseId: item.courseId || 'COURSE-' + Math.floor(Math.random() * 900 + 100),
    courseName: item.courseName || item.course || 'N/A',
    instructor: item.instructor || 'Dr. ' + (item.name ? item.name.split(' ')[0] : 'Unknown'),
    sessionDate: item.sessionDate || new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rating: item.rating || `${Math.floor(Math.random() * 2 + 4)}/5`,
    attendanceRate: item.attendanceRate || `${Math.floor(Math.random() * 15 + 85)}%`,
    comments: item.comments || 'Positive feedback, good engagement',
    concerns: item.concerns || (Math.random() > 0.7 ? 'None' : 'Minor attendance issues'),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Student ID
    { wch: 20 }, // Student Name
    { wch: 12 }, // Course ID
    { wch: 30 }, // Course Name
    { wch: 20 }, // Instructor
    { wch: 15 }, // Session Date
    { wch: 10 }, // Rating
    { wch: 15 }, // Attendance Rate
    { wch: 40 }, // Comments
    { wch: 30 }, // Concerns
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Feedback Report');

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Feedback_Report_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);
};
