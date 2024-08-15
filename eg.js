function getDiscount(totalPrice) {
  const index = Math.floor(Math.random() * 10);

  const discounts = [0, 5, 10, 0, 20, 0, 30, 0, 40, 50];

  return {
    discountPrice: totalPrice - (totalPrice * discounts[index]) / 100,
    discount: discounts[index],
  };
}

const discount = getDiscount(1700000);
console.log(discount);
