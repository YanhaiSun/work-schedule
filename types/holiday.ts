export interface Holiday {
  name: string;           // 节假日名称
  date: string;           // YYYY-MM-DD
  isOffDay: boolean;      // true=休息日, false=调休工作日
}

export interface HolidayFile {
  $schema?: string;
  $id?: string;
  year: number;
  papers?: Array<{
    title: string;
    sections: Array<{
      type: string;
      title: string;
      days: Holiday[];
    }>;
  }>;
  days: Holiday[];
}
