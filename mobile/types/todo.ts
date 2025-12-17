export enum TodoStatus {
  OPEN = "OPEN",
  DONE = "DONE",
  DELETED = "DELETED"
}

export enum TodoType {
  CHECK = "CHECK",
  CALENDAR = "CALENDAR"
}

export interface TodoDTO {
  id?: string;
  summary: string;
  description?: string;
  status: string;
  type: string;
  creationDate: string;
  lastChecked?: string;
  eventDate?: Date;
  reminderFirst?: Date;
  reminderSecond?: Date;
}

export interface Todo {
  id: string;
  summary: string;
  description?: string;
  status: TodoStatus;
  type: TodoType;
  creationDate: Date;
}

export interface CalendarTodo extends Todo {
  calenderRef?: string;
  eventDate: Date;
  reminderFirst?: Date;
  reminderSecond?: Date;
}
