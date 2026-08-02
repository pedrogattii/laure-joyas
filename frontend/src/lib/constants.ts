// Central business configuration for Laure Joyas
export const BUSINESS_CONFIG = {
  name: 'Laure Joyas',
  // Feature flag for WhatsApp integration (enabled)
  whatsappEnabled: true,
  // Phone number for WhatsApp orders (Format: 549 + area code + local number, e.g. 5493510000000)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493510000000',
  storeAddress: 'Super Mami N°4, Ruta E-53, Salsipuedes, Córdoba',
  storeLocationDetail: 'Primera Isla al ingresar al predio comercial',
  hours: 'Lunes a Domingos de 10:00 a 21:00 hs',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Super+Mami+N4+Salsipuedes+Cordoba',
};
