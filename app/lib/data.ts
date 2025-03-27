import postgres from "postgres";
import { CustomersTableType, InvoiceForm, LatestInvoice } from "./definitions";
import { formatCurrency } from "./utils";
import { PrismaClient } from "@prisma/client";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const prisma = new PrismaClient();

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // const data = await sql<Revenue[]>`SELECT * FROM revenue`;
    const data = await prisma.revenue.findMany();

    console.log("Data fetch completed after 3 seconds.");

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    // const data = await sql<LatestInvoiceRaw[]>`
    //   SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   ORDER BY invoices.date DESC
    //   LIMIT 5`;

    const data = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    const latestInvoices: LatestInvoice[] = data.map((invoice) => ({
      id: invoice.id,
      name: invoice.customer.name,
      image_url: invoice.customer.imageUrl,
      email: invoice.customer.email,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    // const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const invoiceCountPromise = prisma.invoice.count();
    // const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const customerCountPromise = prisma.customer.count();
    // const invoiceStatusPromise = sql`SELECT
    //      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    //      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    //      FROM invoices`;
    const invoiceStatusPromise = prisma.invoice.groupBy({
      by: ["status"],
      _sum: {
        amount: true,
      },
      where: {
        status: {
          in: ["pending", "paid"],
        },
      },
    });

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0]);
    const numberOfCustomers = Number(data[1]);
    const totalPaidInvoices = formatCurrency(Number(data[2][0]._sum.amount));
    const totalPendingInvoices = formatCurrency(Number(data[2][1]._sum.amount));

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    query = query || "";

    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, lte: "insensitive" } },
                { email: { contains: query, lte: "insensitive" } },
              ],
            },
          },
          {
            amount: {
              equals: isNaN(Number(query)) ? undefined : Number(query),
            },
          },
          { status: { contains: query, lte: "insensitive" } },
          {
            date: {
              equals: isNaN(Date.parse(query)) ? undefined : new Date(query),
            },
          },
        ],
      },
      orderBy: {
        date: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    // Transform the data to match InvoicesTable[] type
    return invoices.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      date: invoice.date,
      status: invoice.status,
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.imageUrl,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    //   const data = await sql`SELECT COUNT(*)
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   WHERE
    //     customers.name ILIKE ${`%${query}%`} OR
    //     customers.email ILIKE ${`%${query}%`} OR
    //     invoices.amount::text ILIKE ${`%${query}%`} OR
    //     invoices.date::text ILIKE ${`%${query}%`} OR
    //     invoices.status ILIKE ${`%${query}%`}
    // `;
    const data = await prisma.invoice.count({
      select: {
        _all: true,
      },
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, lte: "insensitive" } },
                { email: { contains: query, lte: "insensitive" } },
              ],
            },
          },
          {
            amount: {
              equals: isNaN(Number(query)) ? undefined : Number(query),
            },
          },
          { status: { contains: query, lte: "insensitive" } },
          {
            date: {
              equals: isNaN(Date.parse(query)) ? undefined : new Date(query),
            },
          },
        ],
      },
    });

    console.log(data);

    const totalPages = Math.ceil(Number(data._all) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    // const data = await sql<InvoiceForm[]>`
    //   SELECT
    //     invoices.id,
    //     invoices.customer_id,
    //     invoices.amount,
    //     invoices.status
    //   FROM invoices
    //   WHERE invoices.id = ${id};
    // `;
    const data = await prisma.invoice.findMany({
      select: {
        id: true,
        customerId: true,
        amount: true,
        date: true,
        status: true,
      },
      where: {
        id: {
          equals: id,
        },
      },
    });

    const invoice: InvoiceForm[] = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
      status: invoice.status as "pending" | "paid",
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    // const customers = await sql<CustomerField[]>`
    //   SELECT
    //     id,
    //     name
    //   FROM customers
    //   ORDER BY name ASC
    // `;

    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await prisma.$queryRaw<CustomersTableType[]>`
          SELECT
      customers.id,
      customers.name,
      customers.email,
      customers.image_url,
      COUNT(invoices.id) AS total_invoices,
      SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
      SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
    FROM customers
    LEFT JOIN invoices ON customers.id = invoices.customer_id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
    GROUP BY customers.id, customers.name, customers.email, customers.image_url
    ORDER BY customers.name ASC`;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}
