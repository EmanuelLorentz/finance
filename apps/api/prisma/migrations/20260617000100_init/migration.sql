CREATE TYPE "TransactionType" AS ENUM ('income', 'expense', 'transfer');

CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "budget" DECIMAL(12, 2),
  "deadline" TIMESTAMP(3),
  "impactsBalance" BOOLEAN NOT NULL DEFAULT true,
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "type" "TransactionType" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "account" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "projectId" TEXT,

  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Goal" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "targetAmount" DECIMAL(12, 2) NOT NULL,
  "currentAmount" DECIMAL(12, 2) NOT NULL,
  "deadline" TIMESTAMP(3) NOT NULL,
  "category" TEXT NOT NULL,

  CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UpcomingPayment" (
  "id" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "category" TEXT NOT NULL,
  "isPaid" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "UpcomingPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_categoryId_fkey"
  FOREIGN KEY ("categoryId")
  REFERENCES "Category"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_projectId_fkey"
  FOREIGN KEY ("projectId")
  REFERENCES "Project"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
