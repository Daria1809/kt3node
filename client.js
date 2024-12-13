import fetch from 'node-fetch'; 

const getValutes = async () => {
  try {
    const response = await fetch('http://localhost:3000/getValutes');
    const data = await response.json();
    console.log('Valutes:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

const getValute = async (currencyCode, fromDate, toDate) => {
  try {
    const response = await fetch(`http://localhost:3000/getValute?currencyCode=${currencyCode}&fromDate=${fromDate}&toDate=${toDate}`);
    const data = await response.json();
    console.log('Currency data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

getValutes(); 
