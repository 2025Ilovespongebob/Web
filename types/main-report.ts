// types/main-report.ts

export interface TodayRoute {
  sequenceOrder: number;
  destinationName: string;
  trashGrade: number;
  description: string;
  imageUrl1: string;
  imageUrl2: string;
}

export interface WeeklyRecord {
  dayOfWeek: string;
  status: string;
  trashCount: number;
}

export interface MainReportResponse {
  todayCount: number;
  todayDistance: number;
  todayTime: string;
  todayTrashCount: number;
  carbonReduction: number;
  todayRoutes: TodayRoute[];
  WeeklyRecords: WeeklyRecord[];
}
