/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const { discount, sale_price, quantity } = purchase;
  const decimalDiscount = discount / 100;
  const priceWithDiscount = sale_price * (1 - decimalDiscount);
  const totalRevenue = priceWithDiscount * quantity;
  return totalRevenue;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;
  if (index === 0) {
    return profit * 0.15;
  } else if (index === 1 || index === 2) {
    return profit * 0.1;
  } else if (index === total - 1) {
    return 0;
  } else {
    return profit * 0.05;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (
    !data ||
    !Array.isArray(data.sellers) ||
    data.sellers.length === 0 ||
    !Array.isArray(data.products) ||
    data.products.length === 0 ||
    !Array.isArray(data.purchase_records) ||
    data.purchase_records.length === 0
  ) {
    throw new Error("Некорректные входные данные");
  }

  if (!options || typeof options !== "object") {
    throw new Error("Options должны быть объектом.");
  }
  if (!options.calculateRevenue || !options.calculateBonus) {
    throw new Error("Не переданы функции для расчёта выручки и бонусов.");
  }

  const { calculateRevenue, calculateBonus } = options;

  
  const sellerIndex = data.sellers.reduce(
    (result, seller) => ({
      ...result,
      [seller.id ?? "unknown"]: {
        ...seller, // сначала копируем все поля продавца
        id: seller.id ?? "unknown", // затем задаём id
        name: `${seller.first_name} ${seller.last_name}` || "Неизвестно", // и name
        products_sold: {},
        sales_count: 0,
        revenue: 0,
        profit: 0,
      },
    }),
    {},
  );

  const productIndex = data.products.reduce(
    (result, product) => ({
      ...result,
      [product.sku]: product,
    }),
    {},
  );

  data.purchase_records.forEach((record) => {
    const seller = sellerIndex[record.seller_id];
    seller.sales_count += 1;
    seller.revenue += record.total_amount;

    record.items.forEach((item) => {
      const product = productIndex[item.sku];
      const cost = product.purchase_price * item.quantity;
      const revenue = calculateRevenue(item);
      const profit = revenue - cost.toFixed(2);
      seller.profit += profit;

      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    });
  });

  const sellerStats = Object.values(sellerIndex);
  sellerStats.sort((a, b) => b.profit - a.profit);

  sellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonusByProfit(index, sellerStats.length, seller);

    const topProducts = Object.entries(seller.products_sold)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([productId, quantity]) => ({ productId, quantity }));
    seller.top_products = topProducts;
  });

  
  return sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));
}
// @TODO: Проверка наличия опций

// @TODO: Подготовка промежуточных данных для сбора статистики

// @TODO: Индексация продавцов и товаров для быстрого доступа

// @TODO: Расчет выручки и прибыли для каждого продавца

// @TODO: Сортировка продавцов по прибыли

// @TODO: Назначение премий на основе ранжирования

// @TODO: Подготовка итоговой коллекции с нужными полями
