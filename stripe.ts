export const plans = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    pagesPerPDF: 5,
    price: {
      amount: 0,
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 50,
    pagesPerPDF: 50,
    price: {
      amount: 10,
      priceIds: {
        test: "price_1OObEDGBpH0UJC6N0fIJUmQJ",
        production: "https://quantum-seven.vercel.app",
      },
    },
  },
];
