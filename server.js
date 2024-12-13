const express = require('express');
const soap = require('soap');
const app = express();
const port = 3000;

const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';

app.get('/getValutes', async (req, res) => {
  try {
    const client = await soap.createClientAsync(url);

    const args = {
      On_date: new Date().toISOString(),
    };

    const [result] = await client.GetCursOnDateXMLAsync(args);
    console.log('Response from CBR for getValutes:', JSON.stringify(result, null, 2)); // Логируем ответ

    if (result && result.GetCursOnDateXMLResult && result.GetCursOnDateXMLResult.ValuteData) {
      const valutes = result.GetCursOnDateXMLResult.ValuteData.ValuteCursOnDate || [];

      const formattedValutes = valutes.map(v => ({
        name: v.Vname,
        code: v.VchCode,
        value: parseFloat(v.Vcurs),
        nominal: parseInt(v.Vnom, 10),
      }));

      res.json(formattedValutes); 
    } else {
      res.status(500).send('No valutes data received');
    }
  } catch (error) {
    console.error('Error fetching data from CBR for getValutes:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getValute', async (req, res) => {
  try {
    const { currencyCode, fromDate, toDate } = req.query;

    if (!currencyCode || !fromDate || !toDate) {
      return res.status(400).send('Missing required parameters: currencyCode, fromDate, or toDate');
    }

    const client = await soap.createClientAsync(url);

    const args = {
      FromDate: new Date(fromDate).toISOString(),
      ToDate: new Date(toDate).toISOString(),
      ValutaCode: currencyCode,
    };

    const [result] = await client.GetCursDynamicXMLAsync(args);
    console.log('Response from CBR for getValute:', JSON.stringify(result, null, 2)); // Логируем ответ

    if (result && result.GetCursDynamicXMLResult && result.GetCursDynamicXMLResult.ValuteData) {
      const valuteHistory = result.GetCursDynamicXMLResult.ValuteData.ValuteCursDynamic || [];

      const formattedHistory = valuteHistory.map(v => ({
        date: v.CursDate,
        value: parseFloat(v.Vcurs),
      }));

      if (formattedHistory.length === 0) {
        return res.status(404).send('No valid data available for this currency');
      }

      res.json(formattedHistory); 
    } else {
      res.status(500).send('No historical data available for this currency');
    }
  } catch (error) {
    console.error('Error fetching data from CBR for getValute:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`SOAP proxy server running at http://localhost:${port}`);
});
