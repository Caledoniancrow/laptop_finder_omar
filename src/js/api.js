const DATA_URL = "data/laptops.json";

export const fetchLaptops = async () => {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`${DATA_URL} answered with status ${response.status}.`);
  }
  return response.json();
};

export const findLaptopById = (laptops, laptopId) => laptops.find((laptop) => laptop.id === laptopId);
