import axios from 'axios';

export const getClimaByCidade = async (cidade) => {
  try {
    // 1. Geocoding
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&countryCode=BR`);
    if (!geoRes.data.results) return null;

    const { latitude, longitude } = geoRes.data.results[0];

    // 2. Forecast
    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=America/Sao_Paulo`);
    
    const temp = weatherRes.data.current.temperature_2m;
    const code = weatherRes.data.current.weathercode;
    const isChovendo = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);

    let sugestao = "🌤 Clima agradável! Aproveite para divulgar combos da casa.";
    if (isChovendo) sugestao = "🌧 Dia chuvoso! Ofereça promoções para delivery.";
    else if (temp >= 28) sugestao = "🌞 Dia quente! Destaque combos com bebida gelada.";
    else if (temp <= 18) sugestao = "🥶 Dia frio! Destaque cafés e lanches quentes.";

    return {
      temperatura: temp,
      chove: isChovendo,
      quente: temp >= 28,
      sugestao
    };
  } catch (error) {
    return null;
  }
};