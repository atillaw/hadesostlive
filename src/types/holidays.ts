export interface Holiday {
  key: string;
  name: string;
  title: string;
  subtitle?: string;
  dates?: string;
  description: string;
}

export const HOLIDAYS: Holiday[] = [
  {
    key: 'ataturk_memorial',
    name: '10 Kasım - Atatürk\'ü Anma Günü',
    title: 'Unutmadık, Unutmayacağız',
    dates: '1881 - 193∞',
    description: 'Atatürk\'ü Anma Günü'
  },
  {
    key: 'holiday_23_nisan',
    name: '23 Nisan - Ulusal Egemenlik ve Çocuk Bayramı',
    title: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
    subtitle: 'Kutlu Olsun',
    description: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı'
  },
  {
    key: 'holiday_1_mayis',
    name: '1 Mayıs - Emek ve Dayanışma Günü',
    title: '1 Mayıs Emek ve Dayanışma Günü',
    subtitle: 'Kutlu Olsun',
    description: '1 Mayıs İşçi Bayramı'
  },
  {
    key: 'holiday_19_mayis',
    name: '19 Mayıs - Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
    title: '19 Mayıs Gençlik ve Spor Bayramı',
    subtitle: 'Kutlu Olsun',
    description: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı'
  },
  {
    key: 'holiday_15_temmuz',
    name: '15 Temmuz - Demokrasi ve Milli Birlik Günü',
    title: '15 Temmuz Demokrasi ve Milli Birlik Günü',
    subtitle: 'Şehitlerimizi Rahmetle Anıyoruz',
    description: '15 Temmuz Demokrasi ve Milli Birlik Günü'
  },
  {
    key: 'holiday_30_agustos',
    name: '30 Ağustos - Zafer Bayramı',
    title: '30 Ağustos Zafer Bayramı',
    subtitle: 'Kutlu Olsun',
    description: '30 Ağustos Zafer Bayramı'
  },
  {
    key: 'holiday_29_ekim',
    name: '29 Ekim - Cumhuriyet Bayramı',
    title: '29 Ekim Cumhuriyet Bayramı',
    subtitle: 'Kutlu Olsun',
    description: '29 Ekim Cumhuriyet Bayramı'
  },
  {
    key: 'holiday_ramazan',
    name: 'Ramazan Bayramı',
    title: 'Ramazan Bayramınız',
    subtitle: 'Mübarek Olsun',
    description: 'Ramazan Bayramı'
  },
  {
    key: 'holiday_kurban',
    name: 'Kurban Bayramı',
    title: 'Kurban Bayramınız',
    subtitle: 'Mübarek Olsun',
    description: 'Kurban Bayramı'
  }
];
