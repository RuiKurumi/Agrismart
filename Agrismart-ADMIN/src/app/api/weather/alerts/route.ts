import {NextRequest, NextResponse} from 'next/server';


const PH_PROVINCES = [
  'Metro Manila', 'Cebu', 'Davao del Sur', 'Iloilo', 'Laguna',
  'Batangas', 'Pampanga', 'Bulacan', 'Cavite', 'Occidental Mindoro',
  'Nueva Ecija', 'Pangasinan', 'Isabela', 'Negros Occidental', 'Palawan',
] as const;

const PROVINCE_COORDINATES = {
  'Metro Manila': { latitude: 14.6042, longitude: 120.9822 },
  Cebu: { latitude: 10.3157, longitude: 123.8854 },
  'Davao del Sur': { latitude: 6.7528, longitude: 125.3572 },
  Iloilo: { latitude: 10.7202, longitude: 122.5621 },
  Laguna: { latitude: 14.1709, longitude: 121.2442 },
  Batangas: { latitude: 13.7565, longitude: 121.0583 },
  Pampanga: { latitude: 15.0794, longitude: 120.62 },
  Bulacan: { latitude: 14.7943, longitude: 120.8799 },
  Cavite: { latitude: 14.2456, longitude: 120.8786 },
  'Occidental Mindoro': { latitude: 13.1024, longitude: 120.7651 },
  'Nueva Ecija': { latitude: 15.5784, longitude: 121.1113 },
  Pangasinan: { latitude: 15.8949, longitude: 120.2863 },
  Isabela: { latitude: 16.9754, longitude: 121.8107 },
  'Negros Occidental': { latitude: 10.2926, longitude: 123.0247 },
  Palawan: { latitude: 9.8349, longitude: 118.7384 },
} as const;

const getCondition = (code: number) =>{
    if(code === 0) return 'Sunny';
    if(code <=3) return 'Cloudy';
    if(code <=48) return 'Foggy';
    if(code <= 67) return 'Rain';
    if(code <= 82) return 'Showers';
    return 'Storm';
};

export async function GET(req: NextRequest){
   try{
    const province = req.nextUrl.searchParams.get('province');

    if(!province || !(province in PROVINCE_COORDINATES)){
        return NextResponse.json({error: 'Invalid Province'}, {status: 400});  
    }
    const {latitude, longitude} = PROVINCE_COORDINATES[province as keyof typeof PROVINCE_COORDINATES];

    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current:
        `temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code`,
        daily:
        'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
        timezone: 'Asia/Manila',
        forecast_days: '5',
    });
    const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`
    );
    const wx = await wxRes.json();

    if(!wxRes.ok || !wx.current || !wx.daily) {
        throw new Error('Weather API Failed');
    }


    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const result = {
        location: province,
        temperature: wx.current.temperature_2m,
        humidity: wx.current.relative_humidity_2m,
        windSpeed: wx.current.wind_speed_10m,
        precipitation: wx.current.precipitation,
        condition: getCondition(wx.current.weather_code),
        forecast: wx.daily.time.slice(0, 5).map((date:string, i: number) =>({
            day: days[new Date(date).getDay()],
            max: wx.daily.temperature_2m_max[i],
            min: wx.daily.temperature_2m_min[i],
            rain: wx.daily.precipitation_sum[i],
            condition: getCondition(wx.daily.weather_code[i]),
        })),
    };
    return NextResponse.json(result);
   } catch (err){
    return NextResponse.json(
        {error: 'Failed to fetch weather.'},
        {status: 500}
    );
   }
}