import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Users
  await prisma.user.createMany({
    data: [
      {
        id: "410544b2-4001-4271-9855-fec4b6a6442a",
        name: "User",
        email: "user@nextmail.com",
        password: "123456", // Store securely using hashing in production
      },
    ],
    skipDuplicates: true, // Avoid duplicate entries
  });

  // Seed Customers
  await prisma.customer.createMany({
    data: [
      {
        id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
        name: "Evil Rabbit",
        email: "evil@rabbit.com",
        imageUrl: "/customers/evil-rabbit.png",
      },
      {
        id: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
        name: "Delba de Oliveira",
        email: "delba@oliveira.com",
        imageUrl: "/customers/delba-de-oliveira.png",
      },
      {
        id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
        name: "Lee Robinson",
        email: "lee@robinson.com",
        imageUrl: "/customers/lee-robinson.png",
      },
      {
        id: "76d65c26-f784-44a2-ac19-586678f7c2f2",
        name: "Michael Novotny",
        email: "michael@novotny.com",
        imageUrl: "/customers/michael-novotny.png",
      },
      {
        id: "CC27C14A-0ACF-4F4A-A6C9-D45682C144B9",
        name: "Amy Burns",
        email: "amy@burns.com",
        imageUrl: "/customers/amy-burns.png",
      },
      {
        id: "13D07535-C59E-4157-A011-F8D2EF4E0CBB",
        name: "Balazs Orban",
        email: "balazs@orban.com",
        imageUrl: "/customers/balazs-orban.png",
      },
    ],
    skipDuplicates: true,
  });

  // Seed Invoices
  await prisma.invoice.createMany({
    data: [
      {
        customerId: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
        amount: 15795,
        status: "pending",
        date: new Date("2022-12-06"),
      },
      {
        customerId: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
        amount: 20348,
        status: "pending",
        date: new Date("2022-11-14"),
      },
      {
        customerId: "CC27C14A-0ACF-4F4A-A6C9-D45682C144B9",
        amount: 3040,
        status: "paid",
        date: new Date("2022-10-29"),
      },
      {
        customerId: "76d65c26-f784-44a2-ac19-586678f7c2f2",
        amount: 44800,
        status: "paid",
        date: new Date("2023-09-10"),
      },
      {
        customerId: "13D07535-C59E-4157-A011-F8D2EF4E0CBB",
        amount: 34577,
        status: "pending",
        date: new Date("2023-08-05"),
      },
      {
        customerId: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
        amount: 54246,
        status: "pending",
        date: new Date("2023-07-16"),
      },
      {
        customerId: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
        amount: 666,
        status: "pending",
        date: new Date("2023-06-27"),
      },
      {
        customerId: "76d65c26-f784-44a2-ac19-586678f7c2f2",
        amount: 32545,
        status: "paid",
        date: new Date("2023-06-09"),
      },
    ],
    skipDuplicates: true,
  });

  // Seed Revenue
  await prisma.revenue.createMany({
    data: [
      { month: "Jan", revenue: 2000 },
      { month: "Feb", revenue: 1800 },
      { month: "Mar", revenue: 2200 },
      { month: "Apr", revenue: 2500 },
      { month: "May", revenue: 2300 },
      { month: "Jun", revenue: 3200 },
      { month: "Jul", revenue: 3500 },
      { month: "Aug", revenue: 3700 },
      { month: "Sep", revenue: 2500 },
      { month: "Oct", revenue: 2800 },
      { month: "Nov", revenue: 3000 },
      { month: "Dec", revenue: 4800 },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding completed!");
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
