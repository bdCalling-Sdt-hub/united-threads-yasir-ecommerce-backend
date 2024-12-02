/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORDER_TYPE, PAYMENT_STATUS } from "../order/order.constant";
import OrderModel from "../order/order.model";
import { PaymentModel } from "../payment/payment.model";
import UserModel from "../user/user.model";

const getMonthlyRevenue = async (query: Record<string, unknown>) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Use the provided year or default to the current year
  const targetYear = Number(query?.year) || new Date().getFullYear();

  const monthlyRevenue = await PaymentModel.aggregate([
    {
      // Match payments in the target year and ensure the status is PAID
      $match: {
        createdAt: {
          $gte: new Date(`${targetYear}-01-01`), // Start of the target year
          $lt: new Date(`${targetYear + 1}-01-01`), // Start of the next year
        },
        status: "PAID", // Ensure the status is PAID (check if this matches your db value)
      },
    },
    {
      // Group by month and calculate total revenue
      $group: {
        _id: { month: { $month: "$createdAt" } }, // Group by month
        totalRevenue: { $sum: "$amount" }, // Sum the payment amounts for each month
      },
    },
    {
      $project: {
        _id: 0, // Remove _id field
        monthIndex: "$_id.month", // Keep the month index
        totalRevenue: 1, // Keep the total revenue field
      },
    },
  ]);

  // Initialize a result array for all months
  const result = months.map((month, index) => {
    const found = monthlyRevenue.find((item) => item.monthIndex === index + 1);
    return {
      name: month.substr(0, 3), // Shortened month name
      totalRevenue: found ? found.totalRevenue / 100 : 0,
    };
  });

  return result;
};

const getUsersCount = async (query: Record<string, unknown>) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Use the provided year or default to the current year
  const targetYear = Number(query?.year) || new Date().getFullYear();

  const userCounts = await UserModel.aggregate([
    {
      // Match users based on the query and creation date in the target year
      $match: {
        ...query,
        createdAt: {
          $gte: new Date(`${targetYear}-01-01`), // Start of the target year
          $lt: new Date(`${targetYear + 1}-01-01`), // Start of the next year
        },
      },
    },
    {
      // Group by month and role, then count users
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          role: "$role", // Group by role as well
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0, // Remove _id field
        monthIndex: "$_id.month", // Month from group _id
        role: "$_id.role", // Role from group _id
        count: 1,
      },
    },
  ]);

  // Initialize an empty object to hold the results
  const result: any = {};

  // Organize counts by month and role
  userCounts.forEach(({ monthIndex, role, count }) => {
    const month = months[monthIndex - 1]; // Convert month index to month name
    if (!result[month]) {
      result[month] = { name: month.substr(0, 3), CUSTOMER: 0, ADMIN: 0, CSR: 0 }; // Initialize roles with 0
    }
    result[month][role] = count; // Assign the count based on the role
  });

  // Ensure all months are accounted for and in the correct format
  const allMonths = months.map((month) => {
    return result[month] || { name: month.substr(0, 3), CUSTOMER: 0, ADMIN: 0, CSR: 0 }; // Default to 0 for roles if no data exists
  });

  return allMonths;
};

const getMonthlyProductOrderQuantities = async (query: Record<string, unknown>) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Use the provided year or default to the current year
  const targetYear = Number(query?.year) || new Date().getFullYear();

  const monthlyOrderQuantities = await OrderModel.aggregate([
    {
      // Match only orders with paymentStatus as 'PAID' and within the target year
      $match: {
        paymentStatus: "PAID",
        createdAt: {
          $gte: new Date(`${targetYear}-01-01`), // Start of the year
          $lt: new Date(`${targetYear + 1}-01-01`), // Start of the next year
        },
      },
    },
    {
      // Group by month and sum up the quantities
      $group: {
        _id: { month: { $month: "$createdAt" } }, // Group by month
        totalQuantity: { $sum: "$quantity" }, // Sum of product quantities
      },
    },
    {
      $project: {
        _id: 0, // Remove _id field
        monthIndex: "$_id.month", // Keep the month index
        totalQuantity: 1, // Keep the total quantity field
      },
    },
  ]);

  // Initialize a result array for all months
  const result = months.map((month, index) => {
    const found = monthlyOrderQuantities.find((item) => item.monthIndex === index + 1);
    // NOTE:STRIPE MAKE THE AMOUNT IS IN CENTS. SO DIVIDE BY 100
    return {
      name: month.substr(0, 3), // Shortened month name
      totalQuantity: found ? found.totalQuantity : 0, // Use found quantity or 0 if not found
    };
  });

  return result;
};

const getUserAndRevenueNumber = async () => {
  const result = await UserModel.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);

  const orders = await OrderModel.find({
    paymentStatus: PAYMENT_STATUS.PAID,
  }).lean();

  const totalRevenue = orders.reduce((total, order) => {
    if (order.orderType === ORDER_TYPE.QUOTE) {
      return total + order.amount;
    } else {
      return (total + order.amount) * (order?.quantity ?? 1);
    }
  }, 0);

  const getTodayOrders = await OrderModel.find({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });

  const todayRevenue = getTodayOrders.reduce((total, order) => {
    if (order.orderType === ORDER_TYPE.QUOTE) {
      return total + order.amount;
    } else {
      return (total + order.amount) * (order?.quantity ?? 1);
    }
  }, 0);

  return {
    userCount: result[0]?.count || 0,
    revenueCount: totalRevenue,
    todayRevenue: todayRevenue,
  };
};

const getYearlyRevenueWithGrowth = async (query: Record<string, unknown>) => {
  // Use the provided year or default to the current year
  const targetYear = Number(query?.year) || new Date().getFullYear();
  const previousYear = targetYear - 1;

  // Helper function to get total revenue for a given year
  const getTotalRevenueForYear = async (year: number) => {
    const result = await PaymentModel.aggregate([
      {
        // Match payments in the specified year and ensure the status is PAID
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`), // Start of the specified year
            $lt: new Date(`${year + 1}-01-01`), // Start of the next year
          },
          status: "PAID", // Ensure the status is PAID (adjust according to your DB values)
        },
      },
      {
        // Group and sum the revenue for the entire year
        $group: {
          _id: null, // No grouping by specific field, we're summing for the whole year
          totalRevenue: { $sum: "$amount" }, // Sum all payment amounts
        },
      },
    ]);

    // Return the total revenue or 0 if no payments were found
    return result.length > 0 ? result[0].totalRevenue / 100 : 0; // Convert from cents if necessary
  };

  // Get revenue for the target year and the previous year
  const targetYearRevenue = await getTotalRevenueForYear(targetYear);
  const previousYearRevenue = await getTotalRevenueForYear(previousYear);

  // Calculate growth percentage
  let growthPercentage = 0;
  if (previousYearRevenue > 0) {
    growthPercentage = ((targetYearRevenue - previousYearRevenue) / previousYearRevenue) * 100;
  } else if (targetYearRevenue > 0) {
    growthPercentage = 100;
  }

  // Return the revenue data and growth percentage
  return {
    year: targetYear,
    totalRevenue: targetYearRevenue,
    growthPercentage: parseFloat(growthPercentage.toFixed(2)), // Format to 2 decimal places
  };
};

const getYearlyProductSellingGrowth = async (query: Record<string, unknown>) => {
  // Use the provided year or default to the current year
  const targetYear = Number(query?.year) || new Date().getFullYear();
  const previousYear = targetYear - 1;

  // Helper function to get total quantity of products sold for a given year
  const getTotalQuantityForYear = async (year: number) => {
    const result = await OrderModel.aggregate([
      {
        // Match orders in the specified year and ensure the payment status is PAID
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`), // Start of the specified year
            $lt: new Date(`${year + 1}-01-01`), // Start of the next year
          },
          paymentStatus: "PAID", // Only consider orders with successful payments
        },
      },
      {
        // Group and sum the quantities for the entire year
        $group: {
          _id: null, // No grouping by specific field, summing for the whole year
          totalQuantity: { $sum: "$quantity" }, // Sum all product quantities
        },
      },
    ]);

    // Return the total quantity or 0 if no orders were found
    return result.length > 0 ? result[0].totalQuantity : 0;
  };

  // Get product quantity for the target year and the previous year
  const targetYearQuantity = await getTotalQuantityForYear(targetYear);
  const previousYearQuantity = await getTotalQuantityForYear(previousYear);

  // Calculate growth percentage
  let growthPercentage = 0;
  if (previousYearQuantity > 0) {
    growthPercentage = ((targetYearQuantity - previousYearQuantity) / previousYearQuantity) * 100;
  } else if (targetYearQuantity > 0) {
    growthPercentage = 100; // If there was no quantity sold in the previous year but there is in the current year
  }

  // Return the product quantity data and growth percentage
  return {
    year: targetYear,
    totalQuantity: targetYearQuantity,
    growthPercentage: parseFloat(growthPercentage.toFixed(2)), // Format to 2 decimal places
  };
};

export const MetaServices = {
  getMonthlyRevenue,
  getUsersCount,
  getMonthlyProductOrderQuantities,
  getUserAndRevenueNumber,
  getYearlyRevenueWithGrowth,
  getYearlyProductSellingGrowth,
};
