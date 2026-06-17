export interface UpcomingPayment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
}
