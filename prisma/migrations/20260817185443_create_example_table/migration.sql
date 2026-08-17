-- CreateEnum
CREATE TYPE "UserRoleExample" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "UserExample" (
    "id" TEXT NOT NULL,
    "fristName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRoleExample" NOT NULL DEFAULT 'USER',

    CONSTRAINT "UserExample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserExample_email_key" ON "UserExample"("email");
